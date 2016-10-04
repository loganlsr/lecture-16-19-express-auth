'use strict';

//npm
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

//app
const User = require('../model/user.js');
const server = require('../server.js');
const Gallery = require('../model/gallery.js');

//const
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'logan rogers',
  password: '1234',
  email: 'l@logan.net',
};
const exampleGallery = {
  name: 'beach fun',
  desc: 'too much sand',
};
mongoose.Promise = Promise;

describe('test /api/gallery', function(){

  before( done => {
    if (!server.isRunning){
      server.listen(process.env.PORT, () => {
        console.log('server up');
        done();
      });
      return;
    }
    done();
  });

  after( done => {
    if (server.isRunning){
      server.close(err => {
        if (err) return done(err);
        console.log('server down');
        done();
      });
      return;
    }
  });

  beforeEach( done => {
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then( user => {
      this.tempUser = user;
      return user.generateToken();
    })
    .then( token => {
      this.tempToken = token;
      done();
    })
    .catch(done);
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST to /api/gallery', () =>{

    it('should return a gallery', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id);
        done();
      });
    });

  });
});
