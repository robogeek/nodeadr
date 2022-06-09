
import axios from 'axios';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
const xmlconvert = new XMLParser();

import d2xml from 'data2xml';
console.log(d2xml);
const convert = d2xml();


// This should be a function for debugging printouts
let debug = console.log;

export class ADRConnection {
    constructor() {
        // TODO initialize using the constructor
        // TODO afterward improve the field implementations
    }

    // This would contain info about SSL certificates.  Then this
    // indicates to code to use HTTPS.
    // TODO implement that choice differently
    tlsNode;

    // This seems to be choosing between A and B profile
    oadrProfile = /* config.profile || */ "2.0b";

    // User name and password for authenticating HTTP
    authuser = ''; // this.credentials.authuser || "";
    authpw = ''; // this.credentials.authpw || "";


    /**
     * Send a request
     * 
     * @param url The base URL of the destination for the request
     * @param ei The service to send to
     * @param xml The payload to send
     */
    async sendRequest(url: string, ei: string, xml: string) {
        if (!(url.indexOf("http://") === 0 || url.indexOf("https://") === 0)) {
            if (this.tlsNode) {
                url = "https://" + url;
            } else {
                url = "http://" + url;
            }
        }

        let url_profile = this.oadrProfile == "2.0a" ? "" : `${this.oadrProfile}/`;
        // const _url = `${url}/OpenADR2/Simple/2.0b/${ei}`;
        const _url = `${url}/OpenADR2/Simple/${url_profile}${ei}`;

        const options = {
            url: _url,
            method: "POST",
            headers: {
                "content-type": "application/xml", // <--Very important!!!
            },
            auth: {
                username: undefined,
                password: undefined
            },
            data: undefined
        };

        if (this.tlsNode) {
            //console.log("Adding TLS options");
            //
            this.tlsNode.addTLSOptions(options);
        }

        if (this.authuser !== "" && this.authpw !== "") {
            options.auth = { username: this.authuser, password: this.authpw };
        }
        // options.body = xml;
        options.data = xml;

        console.log(options);
        
        // request(options, cb);
        let response;
        try {
            response = await axios(options);
        } catch (error) {
            if (error.response) {
                debug("REQUEST ERROR STATUS: %s", error.response.status);
                debug("REQUEST ERROR DATA: %s", error.response.data);
                throw new Error(`OADR Req Err: ${error.response.status}\n${error.response.data}`);
            } else if (error.request) {
                debug(error.request);
                throw new Error(`OADR Req Err: ${error.request}`);
            } else {
                debug("ERROR %s", error.message);
                throw new Error(`Error: ${error.message}`);
            }
        }

        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            throw new Error(`OADR ERROR ${response.status} ${response.data}`);
        }

    }


    prepareResMsg(uuid, inCmd, body) {
        const msg = {
            oadr: {
                requestID: uuid || 'unknown',
                requestType: undefined,
                responseType: undefined
            },
            payload: {
                body: body,
                data: undefined,
            },
            responseType: undefined
        };
        let jsdata = xmlconvert.parse(body, { /* ignoreNameSpace: true */ });
        if (jsdata) {
            if (
                this.oadrProfile !== "2.0a" &&
                jsdata.oadrPayload &&
                jsdata.oadrPayload.oadrSignedObject
            ) {
                msg.payload.data = jsdata.oadrPayload.oadrSignedObject;
            } else if (this.oadrProfile == "2.0a") {
                msg.payload.data = jsdata;
            }
            msg.oadr.responseType = getOadrCommand(msg.payload.data);
        }
        msg.oadr.requestType = inCmd;
        return msg;
    }

}


function getOadrCommand(data) {
    let cmd = "unknonwn";
    let property;
    // if (data.oadrPayload.oadrSignedObject){
    //   for ( property in data.oadrPayload.oadrSignedObject ){
    //     cmd = property
    //   }
    for (property in data) {
      cmd = property;
    }
    return cmd;
  }
