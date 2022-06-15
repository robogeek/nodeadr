
import { ADRConnection } from './oadr.js';
import { render_template, oadr_payload } from './templates.js';
import { v4 as uuidv4} from 'uuid';
import { default as Duration } from "iso8601-duration";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';

import * as enums from './enums.js';
import * as types from './types.js';

export type AddReportOptions = {

    /**
     * The quantity that is being measured (enums.MEASUREMENTS).
     * Optional for TELEMETRY_STATUS reports.
     */
    measurement?: types.Measurement;

    /**
     * Whether you want the data to be collected incrementally
     * or at once. If the VTN requests the sampling interval to be
     * higher than the reporting interval, this setting determines
     * if the callback should be called at the sampling rate (with
     * no args, assuming it returns the current value), or at the
     * reporting interval (with date_from and date_to as keyword
     * arguments). Choose 'incremental' for the former case, or
     * 'full' for the latter case.
     */
    data_collection_mode?: string;

    /**
     * A unique identifier for this report. Leave this blank for a
     * random generated id, or fill it in if your VTN depends on
     * this being a known value, or if it needs to be constant
     * between restarts of the client.
     */
    report_specifier_id?: string;

    /**
     * A unique identifier for a datapoint in a report.
     * The same remarks apply as for the report_specifier_id.
     */
    r_id?: string;

    /**
     * An OpenADR reading type (found in openleadr.enums.READING_TYPE)
     */
    reading_type?: enums.READING_TYPE;

    /**
     * An OpenADR name for this report (one of openleadr.enums.REPORT_NAME)
     */
    report_name?: enums.REPORT_NAME;

    /**
     * An OpenADR report type (found in openleadr.enums.REPORT_TYPE)
     */
    report_type?: enums.REPORT_TYPE;

    /**
     * The time span that can be provided in this report.
     * This must be an ISO8601 duration specification string.
     */
    report_duration?: string;

    /**
     * The earliest available data for this report (defaults to now).
     * This must be an ISO8601 date string.
     * e.g. 2013-04-22T15:26:44.123Z
     */
    report_dtstart?: string;

    /**
     * The date/time when the report object was created.  This must
     * be an ISO8601 date string.
     */
    created_date_time?: string;

    /**
     * The sampling rate for the measurement.
     * This must be an ISO8601 duration specification string.
     */
    sampling_rate?: string;
    data_source?: string;
    scale?: string;

    /**
     * The unit for this measurement.
     */
    unit?: string;

    /**
     * Whether the power is AC (True) or DC (False).
     * Only required when supplying a power-related measurement.
     */
    power_ac?: boolean;

    /**
     * Grid frequency of the power.
     * Only required when supplying a power-related measurement.
     */
    power_hertz?: enums.HERTZ;

    /**
     * Voltage of the power.
     * Only required when supplying a power-related measurement.
     */
    power_voltage?: number;

    /**
     * The Market Context that this report belongs to.
     */
    market_context?: string;

    /**
     * the Meter ID for the end device that is measured by this report.
     */
    end_device_asset_mrid?: string;

    /**
     * A (list of) target(s) that this report is related to.
     */
    report_data_source?: Array<string>;
}


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

        this.#reports = [];
        this.#pending_reports = [];
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

    /**
     * Contains the Toad Scheduler object with which we set up
     * recurring tasks to perform.
     */
    #scheduler;

    /**
     * Contains the connection to the VTN.
     */
    #vtnconnection: ADRConnection;

    /**
     * Contains the reports which have been registered
     */
    #reports;

    /**
     * Contains report data waiting to be sent to VTN.
     */
    #pending_reports;

    /**
     * Return the connection object for the VTN connection,
     * creating the connection if needed.
     * 
     * @returns 
     */
    async VTNConnection(): Promise<ADRConnection> {
        if (this.#vtnconnection) {
            return this.#vtnconnection;
        }
        // TODO must initialize the connection
        this.#vtnconnection = new ADRConnection(this.vtn_url);
        return this.#vtnconnection;
    }

    /**
     * Starts the PULL-mode VEN by calling `create_party_registration`
     * to register with the VTN, then starting the task scheduler.
     */
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

        await this.register_reports();

        console.log(`start`)
    }

    add_handler(event: string, callback) {

    }

    /**
     * Adds a new report object to an internal list of reports.
     * 
     * @param callback The function to call to generate report data
     * @param resource_id The resource ID
     * @param options An options object 
     * @returns 
     */
    add_report(callback, resource_id: string, options: AddReportOptions) {

        if (options.report_name && !enums.isReportName(options.report_name)) {
            throw new Error(`add_report: ${options.report_name} is not a valid report name`);
        }
        if (options.reading_type && !enums.isReadingType(options.reading_type)) {
            throw new Error(`add_report: ${options.reading_type} is not a valid reading type`);
        }
        if (options.report_type && !enums.isReportType(options.report_type)) {
            throw new Error(`add_report: ${options.report_type} is not a valid report type`);
        }
        if (options.scale && !enums.isSIScaleCode(options.scale)) {
            throw new Error(`add_report: ${options.scale} is not a valid scale code`);
        }
        if (!options.report_duration) {
            options.report_duration = "PT3600S";
        }
        if (!options.report_dtstart) {
            options.report_dtstart = new Date().toISOString();
        }
        if (!options.sampling_rate) {
            options.sampling_rate = "PT10S";

            /*
             * In OpenLEADR the treatment is a little different.  They
             * have a min_period, max_period, etc.

        if sampling_rate is None:
            sampling_rate = objects.SamplingRate(min_period=timedelta(seconds=10),
                                                 max_period=timedelta(hours=24),
                                                 on_change=False)
        elif isinstance(sampling_rate, timedelta):
            sampling_rate = objects.SamplingRate(min_period=sampling_rate,
                                                 max_period=sampling_rate,
                                                 on_change=False)

             */
        }

        if (options.data_collection_mode) {
            if (options.data_collection_mode !== 'incremental'
             && options.data_collection_mode !== 'full') {
                throw new Error(`add_report - Data Collection Mode ${options.data_collection_mode} is incorrect`);
            }
        }

        let item_base;
        if (options.report_name === enums.REPORT_NAME.TELEMETRY_STATUS) {
            item_base = undefined;
        } else if (options.measurement instanceof types.Measurement) {
            item_base = options.measurement;
        } else if (typeof options.measurement === 'object') {
            if (!types.isMeasurement(options.measurement)) {
                throw new Error(`add_report - Measurement ${options.measurement} not a Measurement`);
            }
            item_base = options.measurement;
        }

        if (options.report_name !== enums.REPORT_NAME.TELEMETRY_STATUS
         && !options.scale) {
            if (item_base.scale) {
                if (enums.isSIScaleCode(options.scale)) {
                    item_base.scale = options.scale;
                }
            }
        }

        if (options.unit 
         && options.unit !== item_base.unit 
         && (!(item_base.acceptable_units.includes(options.unit)))) {
            console.warn(`add_report - The supplied unit ${options.unit} for measurement ${options.measurement} will be ignored.  Instead, ${item_base.unit} will be used.`);
        }

        options.created_date_time = new Date().toISOString();

        let report;

        for (let _report of this.#reports) {
            if (_report.options.report_name === options.report_name) {
                if (options.report_specifier_id
                 && _report.options.report_specifier_id === options.report_specifier_id) {
                    report = _report;
                    break;
                }
            }
        }

        if (!report) {
            let target = new types.Target();
            target.resource_id = resource_id;
            options.r_id = uuidv4();
            report = {
                callback,
                target,
                report_description: new types.ReportDescription(options),
                options
            };
            this.#reports.push(report);
        }
        return report;
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

    /**
     * Register reports with VTN, and schedule report execution.  This
     * should only be called from `run`.
     */
    async register_reports() {
        const request_id = uuidv4();

        const payload = {
            request_id: request_id,
            ven_id: this.ven_id,
            reports: [],
            report_request_id: 0
        };
        for (let report of this.#reports) {
            console.log(report);
            let o = report.options;
            o.report_request_id = 0;
            payload.reports.push(o)
            console.log(o);
        }

        const service = 'EiReport';

        const request = await oadr_payload(
            await render_template('oadrRegisterReport.xml', payload)
        );

        const response = await (await this.VTNConnection())
                        .sendRequest(service, request);

        console.log(response.data);

        const pollResponse = await (await this.VTNConnection())
                                    .reponseRegisterReport(response);
        
        console.log(pollResponse);

        for (let report of this.#reports) {

            const pollTask = new AsyncTask(report.options.report_name,
            async (): Promise<void> => {
                // This job needs to collect the data from the callback,
                // then send it as data to VTN
                const toReport = await report.callback();
                
                // ??? granularity = report_request['granularity']
                // ??? report_back_duration = report_request['report_back_duration']

                // <xs:element name="oadrUpdateReport"
                //             type="oadr:oadrUpdateReportType">
                //   <xs:annotation>
                //     <xs:documentation>
                //          Send a previously requested report</xs:documentation>
                //   </xs:annotation>
                // </xs:element>
                // <xs:complexType name="oadrUpdateReportType">
                //   <xs:sequence>
                //     <xs:element ref="pyld:requestID"/>
                //     <xs:element ref="oadr:oadrReport"
                //                 minOccurs="0" maxOccurs="unbounded"/>
                //     <xs:element ref="ei:venID" minOccurs="0"/>
                //   </xs:sequence>
                //   <xs:attribute ref="ei:schemaVersion" use="optional"/>
                // </xs:complexType>

                const pending = {
                    report_specifier_id: report.options.report_specifier_id,
                    data_collection_mode: report.options.data_collection_mode,
                    outgoing_report: new types.Report()
                };

                pending.outgoing_report.report_specifier_id
                                = report.options.report_specifier_id;
                pending.outgoing_report.report_name
                                = report.options.report_name;
                pending.outgoing_report.data_collection_mode
                                = report.options.data_collection_mode;
                pending.outgoing_report.duration
            });

            const pollJob = new SimpleIntervalJob(
                        Duration.parse(report.options.sampling_rate),
                        pollTask,
                        report.request_id);

            this.#scheduler.addSimpleIntervalJob(pollJob);

            report.job = { pollTask, pollJob };
        }

        return response;
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