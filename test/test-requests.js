let expect = require('chai').expect;
// let request = require('request');
let fs = require('fs');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();


// describe ('Main requests', function() {
//     it('POST', function (done) {
//         request('http://localhost:3005/shelfobjectdetector/detect', function (error, response, body){
//             expect(response.statusCode).to.equal(200);
//             expect(body).to.equal('Hello World');
//             done();
//         })
//     });
// });

chai.use(chaiHttp);

describe('Image processing', () => {
    it('it should not POST without base64 data encoded', (done) => {
        let baseData = fs.readFileSync('test-image-4.jpg', { encoding: 'base64' });
        chai.request(server)
            .post('/shelfobjectdetector/detect')
            .send(baseData)
            .end((err, res) => {
                console.log(res.body);
                res.should.have.status(200);
                done();
            });
    });
});



