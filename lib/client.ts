
import { ADRConnection } from './oadr.js';
import { render_template, oadr_payload } from './templates.js';
import { v4 as uuidv4} from 'uuid';
import { default as Duration } from "iso8601-duration";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';

export type AddReportOptions = {
    measurement;
    data_collection_mode;
    report_specifier_id;
    r_id;
    report_name;
    report_type;
    report_duration;
    report_dtstart;
    sampling_rate;
    data_source;
    scale;
    unit;
    power_ac;
    power_hertz;
    power_voltage;
    market_context;
    end_device_asset_mrid;
    report_data_source;
}


// TODO use a task/job scheduler package to manage timed tasks
//    like sending reports to VTN

// TODO function to construct service URL

/**
 * OpenADR client object, is a.k.a. Virtual End Node.
 */
export class OpenADRClient {

    /**
     * Initializes a new OpenADR Client (Virtual End Node)
     * 
     * @param ven_name The name for this VEN
     * @param ven_id The ID for this VEN. If you leave this blank,
     *               a VEN_ID will be assigned by the VTN.
     * @param vtn_url The URL of the VTN (Server) to connect to
     * @param cert The path to a PEM-formatted Certificate file to use
     *             for signing messages.
     * @param key The path to a PEM-formatted Private Key file to use
     *            for signing messages.
     * @param passphrase The passphrase for the Private Key
     * @param vtn_fingerprint The fingerprint for the VTN's certificate to
     *                        verify incomnig messages
     * @param show_fingerprint Whether to print your own fingerprint
     *                         on startup. Defaults to True.
     * @param ca_file The path to the PEM-formatted CA file for 
     *                validating the VTN server's certificate.
     * @param disable_signature Whether or not to sign outgoing 
     *                messages using a public-private key pair in PEM format.
     */
    constructor(ven_name?: string, ven_id?: string, vtn_url?: string,
        cert?: string, key?: string, passphrase?: string,
        vtn_fingerprint?: string, show_fingerprint?: string,
        ca_file?: string, disable_signature?: boolean) {
        
        this.ven_name = ven_name;
        this.ven_id = ven_id;
        this.vtn_url = vtn_url;
    }

    ven_name: string;
    ven_id: string;
    vtn_url: string;

    /**
     * The ID for the VTN received from the registration event.
     */
    vtn_id: string;

    /**
     * The registration ID received from the registration event
     */
    vtn_registrationID: string;

    /**
     * The value for oadrRequestedOadrPollFreq received
     * from the registration event.
     */
    vtn_requested_poll_frequency: string;

    /**
     * This boolean element is used to indicate the
     * implementation is a Report Only instance of
     * the B profile.
     */
    report_only: boolean = false;

    /**
     * This boolean element is used to indicate the
     * implementation supports XmlSignatures.
     */
    xml_signature: boolean = false;

    /**
     * This boolean element is used to indicate the
     * implementation uses the simpleHTTP PULL
     * exchange model.
     */
    pull_mode: boolean = true;

    /**
     * These are if in push mode, and are the URL the
     * VTN is to use to contact the VEN.
     */
    pushurl: string = undefined;
    pushport: number = undefined;

    #scheduler;

    #vtnconnection: ADRConnection;

    async VTNConnection(): Promise<ADRConnection> {
        if (this.#vtnconnection) {
            return this.#vtnconnection;
        }
        // TODO must initialize the connection
        this.#vtnconnection = new ADRConnection(this.vtn_url);
        return this.#vtnconnection;
    }

    async start() {
        await this.create_party_registration();
        if (!this.vtn_requested_poll_frequency) {
            throw new Error(`start - no polling schedule supplied`);
        }

        this.#scheduler = new ToadScheduler();

        const pollTask = new AsyncTask('VTN Poll', async (): Promise<void> => {
            await this.poll();
        });

        const pollJob = new SimpleIntervalJob(
                    Duration.parse(this.vtn_requested_poll_frequency),
                    pollTask,
                    'id_vtn_poll');

        this.#scheduler.addSimpleIntervalJob(pollJob);
        console.log(`start`)
    }

    add_handler(event: string, callback) {

    }

    add_report(callback, resource_id: string, options: AddReportOptions) {

    }

    query_registration() {

    }

    async create_party_registration(): Promise<void> {
        const requestID = uuidv4();
        const request = await oadr_payload(
            await render_template('oadrCreatePartyRegistration.xml', {
            ven_id: this.ven_id,
            ven_name: this.ven_name,
            request_id: requestID,
            profile_name: (await this.VTNConnection()).oadrProfile,
            transport_name: 'simpleHttp',
            /*
             * If the selected transport is simpleHTTP or
             * XMPP and the oadrHttpPullModel is false, this
             * must contain the address of the VEN server.
             */
            transport_address: '',
            report_only: this.report_only,
            xml_signature: this.xml_signature,
            http_pull_model: this.pull_mode
        }));

        const response = await (await this.VTNConnection())
                        .sendRequest('EiRegisterParty', request);

        const oadrCreatedPartyRegistration = (await this.VTNConnection())
                .responseCreatedPartyRegistration(response);

        if (requestID !== oadrCreatedPartyRegistration.eiResponse.requestID) {
            throw new Error(`create_party_registration response did not match requestID ${requestID}`);
        }

        /*
         * {
         *   oadrCreatedPartyRegistration: {
         *       eiResponse: {
         *           responseCode: 200,
         *           responseDescription: 'OK',
         *           requestID: '385bd330-2bc2-48ef-90d6-51d050d7492a'
         *       },
         *       registrationID: 'reg_id_ven123',
         *       venID: 'ven_id_ven123',
         *       vtnID: 'myvtn',
         *       oadrProfiles: { oadrProfile: [Object] },
         *       oadrRequestedOadrPollFreq: { duration: 'PT10S' }
         *   }
         * }
         */
        this.vtn_id = oadrCreatedPartyRegistration.vtnID;
        this.vtn_registrationID = oadrCreatedPartyRegistration.registrationID;
        this.vtn_requested_poll_frequency
                = oadrCreatedPartyRegistration.oadrRequestedOadrPollFreq.duration;
        
        console.log(`create_party_registration ${this.ven_id} registered with ${this.vtn_id} registration ID ${this.vtn_registrationID} ${this.vtn_requested_poll_frequency}`, Duration.parse(this.vtn_requested_poll_frequency));
    }

    cancel_party_registration() {

    }

    request_event() {

    }

    created_event() {

    }

    register_reports() {

    }

    create_report() {

    }

    create_single_report() {

    }

    update_report() {

    }

    cancel_report() {
        
    }

    /**
     * Request the next available message from the Server.
     */
    async poll() {
        const request = await oadr_payload(
            await render_template('oadrPoll.xml', {
                ven_id: this.ven_id
            })
        );
        
        const response = await (await this.VTNConnection())
                        .sendRequest('OadrPoll', request);

        console.log(response.data);

        /*
         *
         * {
         *  '?xml': '',
         *   oadrPayload: { oadrSignedObject: { oadrResponse: [Object] } }
         * }
         * {
         *   oadrResponse: {
         *       eiResponse: {
         *          responseCode: 200,
         *          responseDescription: 'OK',
         *          requestID: ''
         *       },
         *       venID: 'ven123_id'
         *    }
         * }
         *
         * According to the spec, section 8.6, the response
         * object can be any one of the following:
         *
         *          oadrResponse
         *          oadrDistributeEvent
         *          oadrCreateReport
         *          oadrRegisterReport
         *          oadrCancelReport
         *          oadrUpdateReport
         *          oadrCancelPartyRegistration
         *          oadrRequestReregistration
         *
         * The object returned will depend on whatever the VTN
         * has available to send to the VEN.  It will send only
         * one item at a time.  The VTN is done sending items when
         * it sends an oadrResponse item.
         */
        const pollResponse = await (await this.VTNConnection())
                                    .responsePoll(response);

        console.log(pollResponse);
        console.log(typeof pollResponse);

        if (typeof pollResponse['oadrResponse'] !== 'undefined') {
            console.log(`Poll got oadrResponse -- ALL DONE`);
            return;
        } else if (typeof pollResponse['oadrDistributeEvent'] !== 'undefined') {
            console.log(`Poll got oadrDistributeEvent -- MUST DEVELOP`);
            return;
        } else if (typeof pollResponse['oadrCreateReport'] !== 'undefined') {
            console.log(`Poll got oadrCreateReport -- MUST DEVELOP`);
            return;
        } else if (typeof pollResponse['oadrRegisterReport'] !== 'undefined') {
            console.log(`Poll got oadrRegisterReport -- MUST DEVELOP`);
            return;
        } else if (typeof pollResponse['oadrCancelReport'] !== 'undefined') {
            console.log(`Poll got oadrCancelReport -- MUST DEVELOP`);
            return;
        } else if (typeof pollResponse['oadrUpdateReport'] !== 'undefined') {
            console.log(`Poll got oadrUpdateReport -- MUST DEVELOP`);
            return;
        } else if (typeof pollResponse['oadrCancelPartyRegistration'] !== 'undefined') {
            console.log(`Poll got oadrCancelPartyRegistration -- MUST DEVELOP`);
            return;
        } else if (typeof pollResponse['oadrRequestReregistration'] !== 'undefined') {
            console.log(`Poll got oadrRequestReregistration -- MUST DEVELOP`);
            return;
        } else {
            throw new Error(`Poll received incorrect response ${pollResponse}`);
        }

        // TODO process the response

        /* service = 'OadrPoll'
        message = self._create_message('oadrPoll', ven_id=self.ven_id)
        response_type, response_payload = await self._perform_request(service, message)
        return response_type, response_payload */
    }
}