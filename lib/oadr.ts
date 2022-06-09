
import axios from 'axios';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
const xmlconvert = new XMLParser();

import d2xml from 'data2xml';
console.log(d2xml);
const convert = d2xml();


// This should be a function for debugging printouts
let debug = console.log;

export class ADRConnection {
    constructor(vtn_url: string) {
        this.vtn_url = vtn_url;
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

    vtn_url: string;

    #VTNURL: string;

    VTNURL() {
        if (this.#VTNURL) return this.#VTNURL;

        if (!(this.vtn_url.indexOf("http://") === 0
          || this.vtn_url.indexOf("https://") === 0)) {
            if (this.tlsNode) {
                this.vtn_url = "https://" + this.vtn_url;
            } else {
                this.vtn_url = "http://" + this.vtn_url;
            }
        }

        let url_profile = this.oadrProfile == "2.0a" ? "" : `${this.oadrProfile}/`;
        // const _url = `${url}/OpenADR2/Simple/2.0b/${ei}`;
        const slash = this.vtn_url.endsWith('/') ? '' : '/'
        const _url = `${this.vtn_url}${slash}OpenADR2/Simple/${url_profile}`;

        this.#VTNURL = _url;
        return _url;
    }

    /*
     * EI's and Request Types
     *
     * EiRegisterParty  -- CreatePartyRegistration 
     *                  -- QueryRegistration
     *     RESPONSE     -- CreatedPartyRegistration
     *                  -- CancelPartyRegistration
     *     RESPONSE     -- CanceledPartyRegistration
     *
     * EiReport         -- RegisterReport
     *                  -- UpdateReport
     *     RESPONSE     -- RegisteredReport
     *
     * OadrPoll         -- Poll
     *     RESPONSE     -- Response
     *
     * EiOpt            -- CreateOpt
     *                  -- CancelOpt
     *
     * EiEvent          -- RequestEvent
     *                  -- CreatedEvent
     */ 


    /**
     * Send a request
     * 
     * @param url The base URL of the destination for the request
     * @param ei The service to send to
     * @param xml The payload to send
     */
    async sendRequest(url: string, ei: string, xml: string) {
        const req_url = this.VTNURL() + ei;

        const options = {
            url: req_url,
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

        console.log(`sendRequest ${req_url}`, options);
        
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

    responseCreatedPartyRegistration(response) {
        const parser = new XMLParser({
            removeNSPrefix: true
        });
        let jsdata = parser.parse(response.data);

        if (!jsdata.oadrPayload) {
            throw new Error(`Response does not have oadrPayload ${jsdata}`);
        }
        if (!jsdata.oadrPayload.oadrSignedObject) {
            throw new Error(`Response does not have oadrSignedObject ${jsdata}`);
        }
        if (!jsdata.oadrPayload.oadrSignedObject.oadrCreatedPartyRegistration) {
            throw new Error(`Response does not have oadrCreatedPartyRegistration ${jsdata}`);
        }
        return jsdata.oadrPayload.oadrSignedObject.oadrCreatedPartyRegistration;
    }

    prepareResMsg(uuid, requestType, body) {
        const msg = {
            oadr: {
                requestID: uuid || 'unknown',
                requestType: requestType,
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
