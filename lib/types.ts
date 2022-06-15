
import * as enums from './enums.js';
import * as types from './types.js';
import { ValidateAccessor, ValidateParams,
     IsInt, IsBoolean, IsISO8601, IsISO8601Duration, IsIn
} from 'runtime-data-validation';

/*
 *

@dataclass
class PowerAttributes:
    hertz: int = 50
    voltage: int = 230
    ac: bool = True

 */

export class PowerAttributes {
    constructor(
            hertz: number = 50,
            voltage: number = 230,
            ac: boolean = true) {
        this.hertz = hertz;
        this.voltage = voltage;
        this.ac = ac;
    }

    #hertz: number = 50;
    @ValidateAccessor<number>()
    @IsInt()
    get hertz(): number { return this.#hertz; }
    set hertz(nh: number) { this.#hertz = nh; }

    #voltage: number = 230;

    @ValidateAccessor<number>()
    @IsInt()
    get voltage(): number { return this.#voltage; }
    set voltage(nv: number) { this.#voltage = nv; }

    #ac: boolean = true;

    @ValidateAccessor<boolean>()
    @IsBoolean()
    get ac(): boolean { return this.#ac; }
    set ac(nac: boolean) { this.#ac = nac; }
}

export function isPowerAttributes(power_attributes) {
    if (!('hertz' in power_attributes)) return false;
    if (typeof power_attributes.hertz !== 'number') return false;
    if (!('voltage' in power_attributes)) return false;
    if (typeof power_attributes.voltage !== 'number') return false;
    if (!('ac' in power_attributes)) return false;
    if (typeof power_attributes.ac !== 'number') return false;
    return true;
}

/*
 *

@dataclass
class Measurement:
    name: str
    description: str
    unit: str
    acceptable_units: List[str] = field(repr=False, default_factory=list)
    scale: str = None
    power_attributes: PowerAttributes = None
    pulse_factor: int = None
    ns: str = 'power'

    def __post_init__(self):
        if self.name not in enums._MEASUREMENT_NAMESPACES:
            self.name = 'customUnit'
        self.ns = enums._MEASUREMENT_NAMESPACES[self.name]

 */

export class Measurement {

    constructor(name: string, description: string, unit: string,
            acceptable_units: Array<string>,
            scale?: string,
            power_attributes ?: PowerAttributes,
            pulse_factor ?: number,
            ns: string = 'power') {
        this.name = name;
        this.description = description;
        this.unit = unit;
        this.acceptable_units = acceptable_units;
        this.scale = scale;
        this.power_attributes = power_attributes;
        this.pulse_factor = pulse_factor;
        this.ns = ns;
    }

    name: string;
    description: string;
    unit: string;
    acceptable_units: Array<string>;
    scale?: string;
    power_attributes ?: PowerAttributes;
    pulse_factor ?: number;
    ns: string = 'power'

}

export function isMeasurement(measurement) {
    if (!('name' in measurement)) return false;
    if (typeof measurement.name !== 'string') return false;
    if (!('description' in measurement)) return false;
    if (typeof measurement.description !== 'string') return false;
    if (!('unit' in measurement)) return false;
    if (typeof measurement.unit !== 'string') return false;
    if (!('acceptable_units' in measurement)) return false;
    if (measurement.scale
     && typeof measurement.scale !== 'string') return false;
    if (measurement.pulse_factor
     && typeof measurement.pulse_factor !== 'number') return false;
    if (measurement.ns
     && typeof measurement.ns !== 'string') return false;
    if (measurement.power_attributes
     && !isPowerAttributes(measurement.power_attributes)) return false;
    return true;
}

export type AggregatedPNode = {
    node: string;
};

export type EndDeviceAsset = {
    mrid: string;
};

export type MeterAsset = {
    mrid: string;
};

export type PNode = {
    node: string;
};


export type FeatureCollection = {
    id: string;
    location: [];
};


export type ServiceArea = {
    feature_collection: FeatureCollection;
};


export type ServiceDeliveryPoint = {
    node: string;
};

export type ServiceLocation = {
    node: string;
};

export type TransportInterface = {
    point_of_receipt: string;
    point_of_delivery: string;
};



/*

@dataclass
class Target:
    aggregated_p_node: AggregatedPNode = None
    end_device_asset: EndDeviceAsset = None
    meter_asset: MeterAsset = None
    p_node: PNode = None
    service_area: ServiceArea = None
    service_delivery_point: ServiceDeliveryPoint = None
    service_location: ServiceLocation = None
    transport_interface: TransportInterface = None
    group_id: str = None
    group_name: str = None
    resource_id: str = None
    ven_id: str = None
    party_id: str = None

    def __repr__(self):
        targets = {key: value for key, value in asdict(self).items() if value is not None}
        targets_str = ", ".join(f"{key}={value}" for key, value in targets.items())
        return f"Target('{targets_str}')"


 */
export class Target {

    aggregated_p_node?: AggregatedPNode;
    end_device_asset?: EndDeviceAsset;
    meter_asset?: MeterAsset;
    p_node?: PNode;
    service_area?: ServiceArea;
    service_delivery_point?: ServiceDeliveryPoint;
    service_location?: ServiceLocation;
    transport_interface?: TransportInterface;
    group_id?: string;
    group_name?: string;
    resource_id?: string;
    ven_id?: string;
    party_id?: string;
}

/**
 * Describes the subject and attributes of a report.
 * 
 * Source - OpenLEADR openleadr/schema/oadr_20b.xsd
 */
export class ReportDescription {
    constructor(options,
        report_subject?: Target,
        report_data_source?: Target) {
        if (options.r_id) this.r_id = options.r_id;
        if (options.market_context) this.market_context = options.market_context;
        if (options.reading_type) this.reading_type = options.reading_type;
        if (report_subject) this.report_subject = report_subject;
        if (report_data_source) this.report_data_source = report_data_source;
        if (options.report_type) this.report_type = options.report_type;
        if (options.sampling_rate) this.sampling_rate = options.sampling_rate;
        if (options.measurement) this.measurement = options.measurement;
    }


    /**
     * A unique identifier for a datapoint in a report.
     * The same remarks apply as for the report_specifier_id.
     * ei:rID
     */
    r_id?: string;


    /**
     * The Market Context that this report belongs to.
     * emix:marketContext
     */
    market_context?: string;

    /**
     * An OpenADR reading type (found in openleadr.enums.READING_TYPE)
     * ei:readingType
     */
    reading_type?: enums.READING_TYPE;

    /**
     * ei:reportSubject
     */
    report_subject?: Target;

    /**
     * ei:reportDataSource
     */
    report_data_source?: Target;


    /**
     * An OpenADR report type (found in openleadr.enums.REPORT_TYPE)
     * ei:reportType
     */
    report_type?: enums.REPORT_TYPE;

    /**
     * The sampling rate for the measurement.
     * This must be an ISO8601 duration specification string.
     * oadr:oadrSamplingRate
     */
    #sampling_rate?: string;

    @ValidateAccessor<string>()
    @IsISO8601Duration()
    set sampling_rate(nd: string) { this.#sampling_rate = nd; }
    get sampling_rate() { return this.#sampling_rate; }

    /**
     * The quantity that is being measured (enums.MEASUREMENTS).
     * Optional for TELEMETRY_STATUS reports.
     */
    measurement?: types.Measurement;

}

/*

@dataclass
class ReportPayload:
    r_id: str
    value: float
    confidence: int = None
    accuracy: int = None

*/

export class ReportPayload {
    r_id: string;
    value: number;
    
    #confidence?: number;

    @ValidateAccessor<number>()
    @IsInt()
    set confidence(nc: number) { this.#confidence = nc; }
    get confidence() { return this.#confidence; }

    #accuracy?: number;

    @ValidateAccessor<number>()
    @IsInt()
    set accuracy(nc: number) { this.#accuracy = nc; }
    get accuracy() { return this.#accuracy; }
}

/*


@dataclass
class ReportInterval:
    dtstart: datetime
    report_payload: ReportPayload
    duration: timedelta = None
 */

export class ReportInterval {
    /**
     * ISO8601 date
     */
    #dtstart: string;

    @ValidateAccessor<string>()
    @IsISO8601()
    set dtstart(nd: string) { this.#dtstart = nd; }
    get dtstart() { return this.#dtstart; }


    report_payload: ReportPayload;

    /**
     * ISO8601 duration
     */
    #duration?: string;

    @ValidateAccessor<string>()
    @IsISO8601Duration()
    set duration(nd: string) { this.#duration = nd; }
    get duration() { return this.#duration; }

}

/*


@dataclass
class Report:
    report_specifier_id: str            # This is what the VEN calls this report
    report_name: str                    # Usually one of the default ones (enums.REPORT_NAME)
    report_request_id: str = None       # Usually empty
    report_descriptions: List[ReportDescription] = None
    created_date_time: datetime = None

    dtstart: datetime = None                # For delivering values
    duration: timedelta = None              # For delivering values
    intervals: List[ReportInterval] = None  # For delivering values
    data_collection_mode: str = 'incremental'

    def __post_init__(self):
        if self.created_date_time is None:
            self.created_date_time = datetime.now(timezone.utc)
        if self.report_descriptions is None:
            self.report_descriptions = []


 */

/**
 * eiReport is a Stream of [measurements] recorded over time and delivered to the
 * requestor periodically. The readings may be actual, computed, summed if 
 * derived in some other manner.
 * 
 * Source - OpenLEADR openleadr/schema/oadr_20b.xsd
 */
export class Report {

    /**
     * reference ID to this report.
     * ei:eiReportID
     */
    report_id?: string;

    /**
     * Reference to Metadata report from which this report was derived.
     * ei:reportSpecifierID
     */
    report_specifier_id: string;

    /**
     * Name possibly for use in a user interface.
     * Usually one of the default ones (enums.REPORT_NAME)
     * ei:reportName
     */    
    report_name: string;

    /**
     * Reference to the oadrCreateReport request that defined this report.
     * ei:reportRequestID
     */
    report_request_id?: string;

    /**
     * Define data points the implementation is capable of reporting on.
     * Only used in Metadata report.  There are 0 or more of these.
     */
    report_descriptions?: Array<ReportDescription>;

    /**
     * ISO861 date string
     * ei:createdDateTime
     */

    #created_date_time?: string;

    @ValidateAccessor<string>()
    @IsISO8601()
    set created_date_time(nd: string) { this.#created_date_time = nd; }
    get created_date_time() { return this.#created_date_time; }

    // In the OpenLEADR code, the following are
    // marked with "For delivering values".  These
    // fields do not appear in the XSD file.

    /**
     * ISO8601 date string
     */
    #dtstart?: string;

    @ValidateAccessor<string>()
    @IsISO8601()
    set dtstart(nd: string) { this.#dtstart = nd; }
    get dtstart() { return this.#dtstart; }

    /**
     * ISO8601 duration string
     */
    #duration: string;

    @ValidateAccessor<string>()
    @IsISO8601Duration()
    set duration(nd: string) { this.#duration = nd; }
    get duration() { return this.#duration; }

    intervals?: Array<ReportInterval>;

    #data_collection_mode: string = 'incremental';

    @ValidateAccessor<string>()
    @IsIn([ 'incremental', 'full' ])
    set data_collection_mode(nd: string) { this.#data_collection_mode = nd; }
    get data_collection_mode() { return this.#data_collection_mode; }
}