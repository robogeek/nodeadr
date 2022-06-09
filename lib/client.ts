
import { ADRConnection } from './oadr.js';
import { render_template } from './templates.js';
import { v4 as uuidv4} from 'uuid';

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

    #vtnconnection: ADRConnection;

    async VTNConnection(): Promise<ADRConnection> {
        if (this.#vtnconnection) {
            return this.#vtnconnection;
        }
        // TODO must initialize the connection
        this.#vtnconnection = new ADRConnection();
        return this.#vtnconnection;
    }

    add_handler(event: string, callback) {

    }

    add_report(callback, resource_id: string, options: AddReportOptions) {

    }

    query_registration() {

    }

    async create_party_registration() {

        const request = await render_template('oadrCreatePartyRegistration.xml', {
            ven_id: this.ven_id,
            ven_name: this.ven_name,
            request_id: uuidv4(),
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
        });

        const xml = await render_template('oadrPayload.xml', {
            signed_object: request
        });
        
        const response = await (await this.VTNConnection())
                        .sendRequest(this.vtn_url, 'EiRegisterParty', xml);

        return response;

        /*
        request_id = utils.generate_id()
        service = 'EiRegisterParty'
        payload = {'ven_name': self.ven_name,
                   'ven_id': self.ven_id,
                   'http_pull_model': http_pull_model,
                   'xml_signature': xml_signature,
                   'report_only': report_only,
                   'profile_name': profile_name,
                   'transport_name': transport_name,
                   'transport_address': transport_address}
        
        # logger.debug(f"BEFORE oadrCreatePartyRegistration {request_id}")
        message = self._create_message('oadrCreatePartyRegistration',
                                        request_id=request_id,
                                        **payload)
        # logger.debug(f"BEFORE _perform_request {request_id} {message}")
        response_type, response_payload = await self._perform_request(service, message)
        */
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
        const xml = await render_template('oadrPoll.xml', {
            ven_id: this.ven_id
        });
        
        const response = await (await this.VTNConnection())
                        .sendRequest(this.vtn_url, 'OadrPoll', xml);

        // TODO process the response

        /* service = 'OadrPoll'
        message = self._create_message('oadrPoll', ven_id=self.ven_id)
        response_type, response_payload = await self._perform_request(service, message)
        return response_type, response_payload */
    }
}