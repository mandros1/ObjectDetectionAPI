const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const fs = require('fs');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);

describe('Image processing', () => {
    it('POST request checking', (done) => {
        let baseData = fs.readFileSync('test-image-4.jpg', { encoding: 'base64' });
	let postData = {imageBase64: baseData, token: "DF3A2DEEB01F32C0C6B98DC810FB0D80"};
       	chai.request(server)
            .post('/shelfobjectdetector/detect')
            .send(postData)
            .end((err, res) => {
                if(err) assert.fail(0,1,err);
		let array = null;
		try{
			array = JSON.parse(res.text);
		} catch(e) {
			assert.fail(0,1,'String returned by the POST is not in a format of an array');
		}
		expect(err).to.be.null;
                res.should.have.status(200);
		expect(array).to.be.an('array');
		expect(array).to.not.be.empty;
		expect(array.length).to.be.above(1);
		if(err) done(err);
		else done();
            });
    });
});

