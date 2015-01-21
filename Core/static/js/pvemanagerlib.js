Ext.ns('PVE');

// avoid errors when running without development tools
if (!Ext.isDefined(Ext.global.console)) {   
    var console = { 
	dir: function() {}, 
	log: function() {} 
    };
}
console.log("Starting PVE Manager"); 

Ext.Ajax.defaultHeaders = {
    'Accept': 'application/json'
};

// do not send '_dc' parameter
Ext.Ajax.disableCaching = false;

Ext.Ajax.on('beforerequest', function(conn, options) {
    if (PVE.CSRFPreventionToken) {
	if (!options.headers) { 
	    options.headers = {};
	}
	options.headers.CSRFPreventionToken = PVE.CSRFPreventionToken;
    }
});

// custom Vtypes
Ext.apply(Ext.form.field.VTypes, {
    IPAddress:  function(v) {
        return (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/).test(v);
    },
    IPAddressText:  gettext('Example') + ': 192.168.1.1',
    IPAddressMask: /[\d\.]/i,

    MacAddress: function(v) {
	return (/^([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}$/).test(v);
    },
    MacAddressMask: /[a-fA-F0-9:]/,
    MacAddressText: gettext('Example') + ': 01:23:45:67:89:ab',

    BridgeName: function(v) {
        return (/^vmbr\d{1,4}$/).test(v);
    },
    BridgeNameText: gettext('Format') + ': vmbr<b>N</b>, where 0 <= <b>N</b> <= 9999',

    BondName: function(v) {
        return (/^bond\d{1,4}$/).test(v);
    },
    BondNameText: gettext('Format') + ': bond<b>N</b>, where 0 <= <b>N</b> <= 9999',

    QemuStartDate: function(v) {
	return (/^(now|\d{4}-\d{1,2}-\d{1,2}(T\d{1,2}:\d{1,2}:\d{1,2})?)$/).test(v);
    },
    QemuStartDateText: gettext('Format') + ': "now" or "2006-06-17T16:01:21" or "2006-06-17"',

    StorageId:  function(v) {
        return (/^[a-z][a-z0-9\-\_\.]*[a-z0-9]$/i).test(v);
    },
    StorageIdText: gettext("Allowed characters") + ": 'a-z', '0-9', '-', '_', '.'",

    HttpProxy:  function(v) {
        return (/^http:\/\/.*$/).test(v);
    },
    HttpProxyText: gettext('Example') + ": http://username:password&#64;host:port/",

    DnsName: function(v) {
	return (/^(([a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)\.)*([A-Za-z0-9]([A-Za-z0-9\-]*[A-Za-z0-9])?)$/).test(v);
    },
    DnsNameText: gettext('This is not a valid DNS name')
});

// we dont want that a displayfield set the form dirty flag! 
Ext.override(Ext.form.field.Display, {
    isDirty: function() { return false; }
});

// hack: ExtJS does not display the correct value if we
// call setValue while the store is loading, so we need
// to call it again after loading
Ext.override(Ext.form.field.ComboBox, {
    onLoad: function() {
	this.setValue(this.value, false);
        this.callOverridden(arguments);
    }
});

Ext.define('PVE.Utils', { statics: {

    // this class only contains static functions

    log_severity_hash: {
	0: "panic",
	1: "alert",
	2: "critical",
	3: "error",
	4: "warning",
	5: "notice",
	6: "info",
	7: "debug"
    },

    support_level_hash: {
	'c': gettext('Community'),
	'b': gettext('Basic'),
	's': gettext('Standard'),
	'p': gettext('Premium')
    },

    noSubKeyHtml: 'You do not have a valid subscription for this server. Please visit <a target="_blank" href="http://www.proxmox.com/products/proxmox-ve/subscription-service-plans">www.proxmox.com</a> to get a list of available options.',

    kvm_ostypes: {
	other: gettext('Other OS types'),
	wxp: 'Microsoft Windows XP/2003',
	w2k: 'Microsoft Windows 2000',
	w2k8: 'Microsoft Windows Vista/2008',
	win7: 'Microsoft Windows 7/2008r2',
	win8: 'Microsoft Windows 8/2012',
	l24: 'Linux 2.4 Kernel',
	l26: 'Linux 3.X/2.6 Kernel'
    },

    render_kvm_ostype: function (value) {
	if (!value) {
	    return gettext('Other OS types');
	}
	var text = PVE.Utils.kvm_ostypes[value];
	if (text) {
	    return text + ' (' + value + ')';
	}
	return value;
    },

    render_scsihw: function(value) {
	if (!value) {
	    return PVE.Utils.defaultText + ' (lsi)';
	} else if (value === 'lsi') {
	    return 'LSI 53C895A';
	} else if (value === 'megasas') {
	    return 'MegaRAID SAS 8708EM2';
	} else if (value === 'virtio-scsi-pci') {
	    return 'VIRTIO';
	} else {
	    return value;
	}
    },

    // fixme: auto-generate this
    // for now, please keep in sync with PVE::Tools::kvmkeymaps
    kvm_keymaps: {
	//ar: 'Arabic',
	da: 'Danish',
	de: 'German', 
	'de-ch': 'German (Swiss)', 
	'en-gb': 'English (UK)', 
	'en-us': 'English (USA',
	es: 'Spanish',
	//et: 'Estonia',
	fi: 'Finnish',
	//fo: 'Faroe Islands', 
	fr: 'French', 
	'fr-be': 'French (Belgium)', 
	'fr-ca': 'French (Canada)',
	'fr-ch': 'French (Swiss)',
	//hr: 'Croatia',
	hu: 'Hungarian',
	is: 'Icelandic',
	it: 'Italian', 
	ja: 'Japanese',
	lt: 'Lithuanian',
	//lv: 'Latvian',
	mk: 'Macedonian', 
	nl: 'Dutch',
	//'nl-be': 'Dutch (Belgium)',
	no: 'Norwegian', 
	pl: 'Polish',
	pt: 'Portuguese',
	'pt-br': 'Portuguese (Brazil)',
	//ru: 'Russian',
	sl: 'Slovenian',
	sv: 'Swedish',
	//th: 'Thai',
	tr: 'Turkish'
    },

    kvm_vga_drivers: {
	std: 'Standard VGA',
	vmware: 'VMWare compatible',
	cirrus: 'Cirrus Logic GD5446',
	qxl: 'SPICE',
	serial0: 'Serial terminal 0',
	serial1: 'Serial terminal 1',
	serial2: 'Serial terminal 2',
	serial3: 'Serial terminal 3'
    },

    render_kvm_language: function (value) {
	if (!value) {
	    return PVE.Utils.defaultText;
	}
	var text = PVE.Utils.kvm_keymaps[value];
	if (text) {
	    return text + ' (' + value + ')';
	}
	return value;
    },

    kvm_keymap_array: function() {
	var data = [['', PVE.Utils.render_kvm_language('')]];
	Ext.Object.each(PVE.Utils.kvm_keymaps, function(key, value) {
	    data.push([key, PVE.Utils.render_kvm_language(value)]);
	});

	return data;
    },

    language_map: {
	zh_CN: 'Chinese',
	ca: 'Catalan',
	ja: 'Japanese',
	en: 'English',
	da: 'Danish',
	de: 'German',
	es: 'Spanish',
	fr: 'French',
	it: 'Italian',
	nb: 'Norwegian (Bokmal)',
	nn: 'Norwegian (Nynorsk)',
	ru: 'Russian',
	sl: 'Slovenian',
	sv: 'Swedish',
	pl: 'Polish',
	pt_BR: 'Portuguese (Brazil)',
	tr: 'Turkish'
    },

    render_language: function (value) {
	if (!value) {
	    return PVE.Utils.defaultText + ' (English)';
	}
	var text = PVE.Utils.language_map[value];
	if (text) {
	    return text + ' (' + value + ')';
	}
	return value;
    },

    language_array: function() {
	var data = [['', PVE.Utils.render_language('')]];
	Ext.Object.each(PVE.Utils.language_map, function(key, value) {
	    data.push([key, PVE.Utils.render_language(value)]);
	});

	return data;
    },

    render_kvm_vga_driver: function (value) {
	if (!value) {
	    return PVE.Utils.defaultText;
	}
	var text = PVE.Utils.kvm_vga_drivers[value];
	if (text) { 
	    return text + ' (' + value + ')';
	}
	return value;
    },

    kvm_vga_driver_array: function() {
	var data = [['', PVE.Utils.render_kvm_vga_driver('')]];
	Ext.Object.each(PVE.Utils.kvm_vga_drivers, function(key, value) {
	    data.push([key, PVE.Utils.render_kvm_vga_driver(value)]);
	});

	return data;
    },

    render_kvm_startup: function(value) {
	var startup = PVE.Parser.parseStartup(value);

	var res = 'order=';
	if (startup.order === undefined) {
	    res += 'any';
	} else {
	    res += startup.order;
	}
	if (startup.up !== undefined) {
	    res += ',up=' + startup.up;
	}
	if (startup.down !== undefined) {
	    res += ',down=' + startup.down;
	}

	return res;
    },

    authOK: function() {
	return Ext.util.Cookies.get('PVEAuthCookie');
    },

    authClear: function() {
	Ext.util.Cookies.clear("PVEAuthCookie");
    },

    // fixme: remove - not needed?
    gridLineHeigh: function() {
	return 21;
	
	//if (Ext.isGecko)
	//return 23;
	//return 21;
    },

    extractRequestError: function(result, verbose) {
	var msg = gettext('Successful');

	if (!result.success) {
	    msg = gettext("Unknown error");
	    if (result.message) {
		msg = result.message;
		if (result.status) {
		    msg += ' (' + result.status + ')';
		}
	    }
	    if (verbose && Ext.isObject(result.errors)) {
		msg += "<br>";
		Ext.Object.each(result.errors, function(prop, desc) {
		    msg += "<br><b>" + Ext.htmlEncode(prop) + "</b>: " + 
			Ext.htmlEncode(desc);
		});
	    }	
	}

	return msg;
    },

    extractFormActionError: function(action) {
	var msg;
	switch (action.failureType) {
	case Ext.form.action.Action.CLIENT_INVALID:
	    msg = gettext('Form fields may not be submitted with invalid values');
	    break;
	case Ext.form.action.Action.CONNECT_FAILURE:
	    msg = gettext('Connection error');
	    var resp = action.response;
	    if (resp.status && resp.statusText) {
		msg += " " + resp.status + ": " + resp.statusText;
	    }
	    break;
	case Ext.form.action.Action.LOAD_FAILURE:
	case Ext.form.action.Action.SERVER_INVALID:
	    msg = PVE.Utils.extractRequestError(action.result, true);
	    break;
	}
	return msg;
    },

    // Ext.Ajax.request
    API2Request: function(reqOpts) {

	var newopts = Ext.apply({
	    waitMsg: gettext('Please wait...')
	}, reqOpts);

	if (!newopts.url.match(/^\/api2/)) {
	    newopts.url = '/api2/extjs' + newopts.url;
	}
	delete newopts.callback;

	var createWrapper = function(successFn, callbackFn, failureFn) {
	    Ext.apply(newopts, {
		success: function(response, options) {
		    if (options.waitMsgTarget) {
			options.waitMsgTarget.setLoading(false);
		    }
		    var result = Ext.decode(response.responseText);
		    response.result = result;
		    if (!result.success) {
			response.htmlStatus = PVE.Utils.extractRequestError(result, true);
			Ext.callback(callbackFn, options.scope, [options, false, response]);
			Ext.callback(failureFn, options.scope, [response, options]);
			return;
		    }
		    Ext.callback(callbackFn, options.scope, [options, true, response]);
		    Ext.callback(successFn, options.scope, [response, options]);
		},
		failure: function(response, options) {
		    if (options.waitMsgTarget) {
			options.waitMsgTarget.setLoading(false);
		    }
		    response.result = {};
		    try {
			response.result = Ext.decode(response.responseText);
		    } catch(e) {}
		    var msg = gettext('Connection error') + ' - server offline?';
		    if (response.aborted) {
			msg = gettext('Connection error') + ' - aborted.';
		    } else if (response.timedout) {
			msg = gettext('Connection error') + ' - Timeout.';
		    } else if (response.status && response.statusText) {
			msg = gettext('Connection error') + ' ' + response.status + ': ' + response.statusText;
		    }
		    response.htmlStatus = msg;
		    Ext.callback(callbackFn, options.scope, [options, false, response]);
		    Ext.callback(failureFn, options.scope, [response, options]);
		}
	    });
	};

	createWrapper(reqOpts.success, reqOpts.callback, reqOpts.failure);

	var target = newopts.waitMsgTarget;
	if (target) {
	    // Note: ExtJS bug - this does not work when component is not rendered
	    target.setLoading(newopts.waitMsg);
	}
	Ext.Ajax.request(newopts);
    },

    assemble_field_data: function(values, data) {
        if (Ext.isObject(data)) {
	    Ext.Object.each(data, function(name, val) {
		if (values.hasOwnProperty(name)) {
                    var bucket = values[name];
                    if (!Ext.isArray(bucket)) {
                        bucket = values[name] = [bucket];
                    }
                    if (Ext.isArray(val)) {
                        values[name] = bucket.concat(val);
                    } else {
                        bucket.push(val);
                    }
                } else {
		    values[name] = val;
                }
            });
	}
    },

    checked_command: function(orig_cmd) {
	PVE.Utils.API2Request({
	    url: '/nodes/localhost/subscription',
	    method: 'GET',
	    //waitMsgTarget: me,
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, opts) {
		var data = response.result.data;

		if (data.status !== 'Active') {
		    Ext.Msg.show({
			title: 'No valid subscription',
			icon: Ext.Msg.WARNING,
			msg: PVE.Utils.noSubKeyHtml,
			buttons: Ext.Msg.OK,
			callback: function(btn) {
			    if (btn !== 'ok') {
				return;
			    }
			    orig_cmd();
			}
		    });
		} else {
		    orig_cmd();
		}
	    }
	});
    },

    task_desc_table: {
	vncproxy: [ 'VM/CT', gettext('Console') ],
	spiceproxy: [ 'VM/CT', gettext('Spice Console') ],
	vncshell: [ '', gettext('Shell') ],
	qmsnapshot: [ 'VM', gettext('Snapshot') ],
	qmrollback: [ 'VM', gettext('Rollback') ],
	qmdelsnapshot: [ 'VM', gettext('Delete Snapshot') ],
	qmcreate: [ 'VM', gettext('Create') ],
	qmrestore: [ 'VM', gettext('Restore') ],
	qmdestroy: [ 'VM', gettext('Destroy') ],
	qmigrate: [ 'VM', gettext('Migrate') ],
	qmclone: [ 'VM', gettext('Clone') ],
	qmmove: [ 'VM', gettext('Move disk') ],
	qmtemplate: [ 'VM', gettext('Convert to template') ],
	qmstart: [ 'VM', gettext('Start') ],
	qmstop: [ 'VM', gettext('Stop') ],
	qmreset: [ 'VM', gettext('Reset') ],
	qmshutdown: [ 'VM', gettext('Shutdown') ],
	qmsuspend: [ 'VM', gettext('Suspend') ],
	qmresume: [ 'VM', gettext('Resume') ],
	qmconfig: [ 'VM', gettext('Configure') ],
	vzcreate: ['CT', gettext('Create') ],
	vzrestore: ['CT', gettext('Restore') ],
	vzdestroy: ['CT', gettext('Destroy') ],
	vzmigrate: [ 'CT', gettext('Migrate') ],
	vzstart: ['CT', gettext('Start') ],
	vzstop: ['CT', gettext('Stop') ],
	vzmount: ['CT', gettext('Mount') ],
	vzumount: ['CT', gettext('Unmount') ],
	vzshutdown: ['CT', gettext('Shutdown') ],
	hamigrate: [ 'HA', gettext('Migrate') ],
	hastart: [ 'HA', gettext('Start') ],
	hastop: [ 'HA', gettext('Stop') ],
	srvstart: ['SRV', gettext('Start') ],
	srvstop: ['SRV', gettext('Stop') ],
	srvrestart: ['SRV', gettext('Restart') ],
	srvreload: ['SRV', gettext('Reload') ],
	imgcopy: ['', gettext('Copy data') ],
	imgdel: ['', gettext('Erase data') ],
	download: ['', gettext('Download') ],
	vzdump: ['', gettext('Backup') ],
	aptupdate: ['', gettext('Update package database') ],
	startall: [ '', gettext('Start all VMs and Containers') ],
	stopall: [ '', gettext('Stop all VMs and Containers') ]
    },

    format_task_description: function(type, id) {	
	var farray = PVE.Utils.task_desc_table[type];
	if (!farray) {
	    return type;
	}
	var prefix = farray[0];
	var text = farray[1];
	if (prefix) {
	    return prefix + ' ' + id + ' - ' + text; 
	}
	return text;
    },

    parse_task_upid: function(upid) {
	var task = {};

	var res = upid.match(/^UPID:(\S+):([0-9A-Fa-f]{8}):([0-9A-Fa-f]{8}):([0-9A-Fa-f]{8}):([^:\s]+):([^:\s]*):([^:\s]+):$/);
	if (!res) {
	    throw "unable to parse upid '" + upid + "'";
	}
	task.node = res[1];
	task.pid = parseInt(res[2], 16);
	task.pstart = parseInt(res[3], 16);
	task.starttime = parseInt(res[4], 16);
	task.type = res[5];
	task.id = res[6];
	task.user = res[7];

	task.desc = PVE.Utils.format_task_description(task.type, task.id);

	return task;
    },

    format_size: function(size) {
	/*jslint confusion: true */

	if (size < 1024) {
	    return size;
	}

	var kb = size / 1024;

	if (kb < 1024) {
	    return kb.toFixed(0) + "KB";
	}

	var mb = size / (1024*1024);

	if (mb < 1024) {
	    return mb.toFixed(0) + "MB";
	}

	var gb = mb / 1024;

	if (gb < 1024) {
	    return gb.toFixed(2) + "GB";
	}

	var tb =  gb / 1024;

	return tb.toFixed(2) + "TB";

    },

    format_html_bar: function(per, text) {

	return "<div class='pve-bar-wrap'>" + text + "<div class='pve-bar-border'>" +
	    "<div class='pve-bar-inner' style='width:" + per + "%;'></div>" +
	    "</div></div>";
	
    },

    format_cpu_bar: function(per1, per2, text) {

	return "<div class='pve-bar-border'>" +
	    "<div class='pve-bar-inner' style='width:" + per1 + "%;'></div>" +
	    "<div class='pve-bar-inner2' style='width:" + per2 + "%;'></div>" +
	    "<div class='pve-bar-text'>" + text + "</div>" + 
	    "</div>";
    },

    format_large_bar: function(per, text) {

	if (!text) {
	    text = per.toFixed(1) + "%";
	}

	return "<div class='pve-largebar-border'>" +
	    "<div class='pve-largebar-inner' style='width:" + per + "%;'></div>" +
	    "<div class='pve-largebar-text'>" + text + "</div>" + 
	    "</div>";
    },

    format_duration_long: function(ut) {

	var days = Math.floor(ut / 86400);
	ut -= days*86400;
	var hours = Math.floor(ut / 3600);
	ut -= hours*3600;
	var mins = Math.floor(ut / 60);
	ut -= mins*60;

	var hours_str = '00' + hours.toString();
	hours_str = hours_str.substr(hours_str.length - 2);
	var mins_str = "00" + mins.toString();
	mins_str = mins_str.substr(mins_str.length - 2);
	var ut_str = "00" + ut.toString();
	ut_str = ut_str.substr(ut_str.length - 2);

	if (days) {
	    var ds = days > 1 ? PVE.Utils.daysText : PVE.Utils.dayText;
	    return days.toString() + ' ' + ds + ' ' + 
		hours_str + ':' + mins_str + ':' + ut_str;
	} else {
	    return hours_str + ':' + mins_str + ':' + ut_str;
	}
    },

    format_duration_short: function(ut) {
	
	if (ut < 60) {
	    return ut.toString() + 's';
	}

	if (ut < 3600) {
	    var mins = ut / 60;
	    return mins.toFixed(0) + 'm';
	}

	if (ut < 86400) {
	    var hours = ut / 3600;
	    return hours.toFixed(0) + 'h';
	}

	var days = ut / 86400;
	return days.toFixed(0) + 'd';	
    },

    yesText: gettext('Yes'),
    noText: gettext('No'),
    errorText: gettext('Error'),
    unknownText: gettext('Unknown'),
    defaultText: gettext('Default'),
    daysText: gettext('days'),
    dayText: gettext('day'),
    runningText: gettext('running'),
    stoppedText: gettext('stopped'),
    neverText: gettext('never'),

    format_expire: function(date) {
	if (!date) {
	    return PVE.Utils.neverText;
	}
	return Ext.Date.format(date, "Y-m-d");
    },

    format_storage_type: function(value) {
	if (value === 'dir') {
	    return 'Directory';
	} else if (value === 'nfs') {
	    return 'NFS';
	} else if (value === 'glusterfs') {
	    return 'GlusterFS';
	} else if (value === 'lvm') {
	    return 'LVM';
	} else if (value === 'iscsi') {
	    return 'iSCSI';
	} else if (value === 'rbd') {
	    return 'RBD';
	} else if (value === 'sheepdog') {
	    return 'Sheepdog';
	} else if (value === 'nexenta') {
	    return 'Nexenta';
	} else if (value === 'iscsidirect') {
	    return 'iSCSIDirect';
	} else {
	    return PVE.Utils.unknownText;
	}
    },

    format_boolean_with_default: function(value) {
	if (Ext.isDefined(value) && value !== '') {
	    return value ? PVE.Utils.yesText : PVE.Utils.noText;
	}
	return PVE.Utils.defaultText;
    },

    format_boolean: function(value) {
	return value ? PVE.Utils.yesText : PVE.Utils.noText;
    },

    format_neg_boolean: function(value) {
	return !value ? PVE.Utils.yesText : PVE.Utils.noText;
    },

    format_content_types: function(value) {
	var cta = [];

	Ext.each(value.split(',').sort(), function(ct) {
	    if (ct === 'images') {
		cta.push('Images');
	    } else if (ct === 'backup') {
		cta.push('Backups');
	    } else if (ct === 'vztmpl') {
		cta.push('Templates');
	    } else if (ct === 'iso') {
		cta.push('ISO');
	    } else if (ct === 'rootdir') {
		cta.push('Containers');
	    }
	});

	return cta.join(', ');
    },

    render_storage_content: function(value, metaData, record) {
	var data = record.data;
	if (Ext.isNumber(data.channel) &&
	    Ext.isNumber(data.id) &&
	    Ext.isNumber(data.lun)) {
	    return "CH " + 
		Ext.String.leftPad(data.channel,2, '0') + 
		" ID " + data.id + " LUN " + data.lun;
	}
	return data.volid.replace(/^.*:(.*\/)?/,'');
    },

    render_serverity: function (value) {
	return PVE.Utils.log_severity_hash[value] || value;
    },

    render_cpu: function(value, metaData, record, rowIndex, colIndex, store) {

	if (!(record.data.uptime && Ext.isNumeric(value))) {
	    return '';
	}

	var maxcpu = record.data.maxcpu || 1;

	if (!Ext.isNumeric(maxcpu) && (maxcpu >= 1)) {
	    return '';
	}
	
	var per = value * 100;

	return per.toFixed(1) + '% of ' + maxcpu.toString() + (maxcpu > 1 ? 'CPUs' : 'CPU');
    },

    render_size: function(value, metaData, record, rowIndex, colIndex, store) {
	/*jslint confusion: true */

	if (!Ext.isNumeric(value)) {
	    return '';
	}

	return PVE.Utils.format_size(value);
    },

    render_timestamp: function(value, metaData, record, rowIndex, colIndex, store) {
	var servertime = new Date(value * 1000);
	return Ext.Date.format(servertime, 'Y-m-d H:i:s');
    },

    render_mem_usage: function(value, metaData, record, rowIndex, colIndex, store) {

	var mem = value;
	var maxmem = record.data.maxmem;
	
	if (!record.data.uptime) {
	    return '';
	}

	if (!(Ext.isNumeric(mem) && maxmem)) {
	    return '';
	}

	var per = (mem * 100) / maxmem;

	return per.toFixed(1) + '%';
    },

    render_disk_usage: function(value, metaData, record, rowIndex, colIndex, store) {

	var disk = value;
	var maxdisk = record.data.maxdisk;

	if (!(Ext.isNumeric(disk) && maxdisk)) {
	    return '';
	}

	var per = (disk * 100) / maxdisk;

	return per.toFixed(1) + '%';
    },

    render_resource_type: function(value, metaData, record, rowIndex, colIndex, store) {

	var cls = 'pve-itype-icon-' + value;

	if (record.data.running) {
	    metaData.tdCls = cls + "-running";
	} else if (record.data.template) {
	    metaData.tdCls = cls + "-template";	    
	} else {
	    metaData.tdCls = cls;
	}

	return value;
    },

    render_uptime: function(value, metaData, record, rowIndex, colIndex, store) {

	var uptime = value;

	if (uptime === undefined) {
	    return '';
	}
	
	if (uptime <= 0) {
	    return '-';
	}

	return PVE.Utils.format_duration_long(uptime);
    },

    render_support_level: function(value, metaData, record) {
	return PVE.Utils.support_level_hash[value] || '-';
    },

    render_upid: function(value, metaData, record) { 
	var type = record.data.type;
	var id = record.data.id;

	return PVE.Utils.format_task_description(type, id);
    },

    dialog_title: function(subject, create, isAdd) {
	if (create) {
	    if (isAdd) {
		return gettext('Add') + ': ' + subject;
	    } else {
		return gettext('Create') + ': ' + subject;
	    }
	} else {
	    return gettext('Edit') + ': ' + subject;
	}
    },
 
    openConoleWindow: function(vmtype, vmid, nodename, vmname) {
	var url = Ext.urlEncode({
	    console: vmtype, // kvm, openvz or shell
	    vmid: vmid,
	    vmname: vmname,
	    node: nodename
	});
	var nw = window.open("?" + url, '_blank', 
			     "innerWidth=745,innerheight=427");
	nw.focus();
    },

    // comp.setLoading() is buggy in ExtJS 4.0.7, so we 
    // use el.mask() instead
    setErrorMask: function(comp, msg) {
	var el = comp.el;
	if (!el) {
	    return;
	}
	if (!msg) {
	    el.unmask();
	} else {
	    if (msg === true) {
		el.mask(gettext("Loading..."));
	    } else {
		el.mask(msg);
	    }
	}
    },

    monStoreErrors: function(me, store) {
	me.mon(store, 'beforeload', function(s, operation, eOpts) {
	    if (!me.loadCount) {
		me.loadCount = 0; // make sure it is numeric
		PVE.Utils.setErrorMask(me, true);
	    }
	});

	// only works with 'pve' proxy
	me.mon(store.proxy, 'afterload', function(proxy, request, success) {
	    me.loadCount++;

	    if (success) {
		PVE.Utils.setErrorMask(me, false);
		return;
	    }

	    var msg;
	    var operation = request.operation;
	    var error = operation.getError();
	    if (error.statusText) {
		msg = error.statusText + ' (' + error.status + ')';
	    } else {
		msg = gettext('Connection error');
	    }
	    PVE.Utils.setErrorMask(me, msg);
	});
    }

}});

// Some configuration values are complex strings - 
// so we need parsers/generators for them. 

Ext.define('PVE.Parser', { statics: {

    // this class only contains static functions

    parseQemuNetwork: function(key, value) {
	if (!(key && value)) {
	    return;
	}

	var res = {};

	var errors = false;
	Ext.Array.each(value.split(','), function(p) {
	    if (!p || p.match(/^\s*$/)) {
		return; // continue
	    }

	    var match_res;

	    if ((match_res = p.match(/^(ne2k_pci|e1000|rtl8139|pcnet|virtio|ne2k_isa|i82551|i82557b|i82559er)(=([0-9a-f]{2}(:[0-9a-f]{2}){5}))?$/i)) !== null) {
		res.model = match_res[1].toLowerCase();
		if (match_res[3]) {
		    res.macaddr = match_res[3];
		}
	    } else if ((match_res = p.match(/^bridge=(\S+)$/)) !== null) {
		res.bridge = match_res[1];
	    } else if ((match_res = p.match(/^rate=(\d+(\.\d+)?)$/)) !== null) {
		res.rate = match_res[1];
	    } else if ((match_res = p.match(/^tag=(\d+(\.\d+)?)$/)) !== null) {
                res.tag = match_res[1];
	    } else {
		errors = true;
		return false; // break
	    }
	});

	if (errors || !res.model) {
	    return;
	}

	return res;
    },

    printQemuNetwork: function(net) {

	var netstr = net.model;
	if (net.macaddr) {
	    netstr += "=" + net.macaddr;
	}
	if (net.bridge) {
	    netstr += ",bridge=" + net.bridge;
	    if (net.tag) {
		netstr += ",tag=" + net.tag;
	    }
	}
	if (net.rate) {
	    netstr += ",rate=" + net.rate;
	}
	return netstr;
    },

    parseQemuDrive: function(key, value) {
	if (!(key && value)) {
	    return;
	}

	var res = {};

	var match_res = key.match(/^([a-z]+)(\d+)$/);
	if (!match_res) {
	    return;
	}
	res['interface'] = match_res[1];
	res.index = match_res[2];

	var errors = false;
	Ext.Array.each(value.split(','), function(p) {
	    if (!p || p.match(/^\s*$/)) {
		return; // continue
	    }
	    var match_res = p.match(/^([a-z_]+)=(\S+)$/);
	    if (!match_res) {
		if (!p.match(/\=/)) {
		    res.file = p;
		    return; // continue
		}
		errors = true;
		return false; // break
	    }
	    var k = match_res[1];
	    if (k === 'volume') {
		k = 'file';
	    }

	    if (Ext.isDefined(res[k])) {
		errors = true;
		return false; // break
	    }

	    var v = match_res[2];
	    
	    if (k === 'cache' && v === 'off') {
		v = 'none';
	    }

	    res[k] = v;
	});

	if (errors || !res.file) {
	    return;
	}

	return res;
    },

    printQemuDrive: function(drive) {

	var drivestr = drive.file;

	Ext.Object.each(drive, function(key, value) {
	    if (!Ext.isDefined(value) || key === 'file' || 
		key === 'index' || key === 'interface') {
		return; // continue
	    }
	    drivestr += ',' + key + '=' + value;
	});

	return drivestr;
    },

    parseOpenVZNetIf: function(value) {
	if (!value) {
	    return;
	}

	var res = {};

	var errors = false;
	Ext.Array.each(value.split(';'), function(item) {
	    if (!item || item.match(/^\s*$/)) {
		return; // continue
	    }

	    var data = {};
	    Ext.Array.each(item.split(','), function(p) {
		if (!p || p.match(/^\s*$/)) {
		    return; // continue
		}
		var match_res = p.match(/^(ifname|mac|bridge|host_ifname|host_mac|mac_filter)=(\S+)$/);
		if (!match_res) {
		    errors = true;
		    return false; // break
		}
		data[match_res[1]] = match_res[2];
	    });

	    if (errors || !data.ifname) {
		errors = true;
		return false; // break
	    }

	    data.raw = item;

	    res[data.ifname] = data;
	});

	return errors ? undefined: res;
    },

    printOpenVZNetIf: function(netif) {
	var netarray = [];

	Ext.Object.each(netif, function(iface, data) {
	    var tmparray = [];
	    Ext.Array.each(['ifname', 'mac', 'bridge', 'host_ifname' , 'host_mac', 'mac_filter'], function(key) {
		var value = data[key];
		if (value) {
		    tmparray.push(key + '=' + value);
		}
	    });
	    netarray.push(tmparray.join(','));
	});

	return netarray.join(';');
    },

    parseStartup: function(value) {
	if (value === undefined) {
	    return;
	}

	var res = {};

	var errors = false;
	Ext.Array.each(value.split(','), function(p) {
	    if (!p || p.match(/^\s*$/)) {
		return; // continue
	    }

	    var match_res;

	    if ((match_res = p.match(/^(order)?=(\d+)$/)) !== null) {
		res.order = match_res[2];
	    } else if ((match_res = p.match(/^up=(\d+)$/)) !== null) {
		res.up = match_res[1];
	    } else if ((match_res = p.match(/^down=(\d+)$/)) !== null) {
                res.down = match_res[1];
	    } else {
		errors = true;
		return false; // break
	    }
	});

	if (errors) {
	    return;
	}

	return res;
    },
 
    printStartup: function(startup) {
	var arr = [];
	if (startup.order !== undefined && startup.order !== '') {
	    arr.push('order=' + startup.order);
	}
	if (startup.up !== undefined && startup.up !== '') {
	    arr.push('up=' + startup.up);
	}
	if (startup.down !== undefined && startup.down !== '') {
	    arr.push('down=' + startup.down);
	}

	return arr.join(',');
    }

}});
/* This state provider keeps part of the state inside
 * the browser history.
 *
 * We compress (shorten) url using dictionary based compression
 * i.e. use column separated list instead of url encoded hash:
 * #v\d*       version/format
 * :=          indicates string values
 * :\d+        lookup value in dictionary hash
 * #v1:=value1:5:=value2:=value3:...
*/

Ext.define('PVE.StateProvider', {
    extend: 'Ext.state.LocalStorageProvider',

    // private
    setHV: function(name, newvalue, fireEvents) {
	var me = this;

	var changes = false;
	var oldtext = Ext.encode(me.UIState[name]);
	var newtext = Ext.encode(newvalue);
	if (newtext != oldtext) {
	    changes = true;
	    me.UIState[name] = newvalue;
	    //console.log("changed old " + name + " " + oldtext);
	    //console.log("changed new " + name + " " + newtext);
	    if (fireEvents) {
		me.fireEvent("statechange", me, name, { value: newvalue });
	    }
	}
	return changes;
    },

    // private
    hslist: [
	// order is important for notifications
	// [ name, default ]
	['view', 'server'],
	['rid', 'root'],
	['ltab', 'tasks'],
	['nodetab', ''],
	['storagetab', ''],
	['pooltab', ''],
	['kvmtab', ''],
	['ovztab', ''],
	['dctab', '']
    ],

    hprefix: 'v1',

    compDict: {
	snapshot: 29,
	ha: 28,
	support: 27,
	pool: 26,
	syslog: 25,
	ubc: 24,
	initlog: 23,
	openvz: 22,
	backup: 21,
	ressources: 20,
	content: 19,
	root: 18,
	domains: 17,
	roles: 16,
	groups: 15,
	users: 14,
	time: 13,
	dns: 12,
	network: 11,
	services: 10,
	options: 9,
	console: 8,
	hardware: 7,
	permissions: 6,
	summary: 5,
	tasks: 4,
	clog: 3,
	storage: 2,
	folder: 1,
	server: 0
    },

    decodeHToken: function(token) {
	var me = this;

	var state = {};
	if (!token) {
	    Ext.Array.each(me.hslist, function(rec) {
		state[rec[0]] = rec[1];
	    });
	    return state;
	}

	// return Ext.urlDecode(token);

	var items = token.split(':');
	var prefix = items.shift();

	if (prefix != me.hprefix) {
	    return me.decodeHToken();
	}

	Ext.Array.each(me.hslist, function(rec) {
	    var value = items.shift();
	    if (value) {
		if (value[0] === '=') {
		    value = decodeURIComponent(value.slice(1));
		} else {
		    Ext.Object.each(me.compDict, function(key, cv) {
			if (value == cv) {
			    value = key;
			    return false;
			}
		    });
		}
	    }
	    state[rec[0]] = value;
	});

	return state;
    },

    encodeHToken: function(state) {
	var me = this;

	// return Ext.urlEncode(state);

	var ctoken = me.hprefix;
	Ext.Array.each(me.hslist, function(rec) {
	    var value = state[rec[0]];
	    if (!Ext.isDefined(value)) {
		value = rec[1];
	    }
	    value = encodeURIComponent(value);
	    if (!value) {
		ctoken += ':';
	    } else {
		var comp = me.compDict[value];
		if (Ext.isDefined(comp)) {
		    ctoken += ":" + comp;
		} else {
		    ctoken += ":=" + value;
		}
	    }
	});

	return ctoken;
    },

    constructor: function(config){
	var me = this;

	me.callParent([config]);

	me.UIState = me.decodeHToken(); // set default

	var history_change_cb = function(token) {
	    //console.log("HC " + token);
	    if (!token) {
		var res = window.confirm('Are you sure you want to navigate away from this page?');
		if (res){
		    // process text value and close...
		    Ext.History.back();
		} else {
		    Ext.History.forward();
		}
		return;
	    }

	    var newstate = me.decodeHToken(token);
	    Ext.Array.each(me.hslist, function(rec) {
		if (typeof newstate[rec[0]] == "undefined") {
		    return;
		}
		me.setHV(rec[0], newstate[rec[0]], true);
	    });
	};

	var start_token = Ext.History.getToken();
	if (start_token) {
	    history_change_cb(start_token);
	} else {
	    var htext = me.encodeHToken(me.UIState);
	    Ext.History.add(htext);
	}

	Ext.History.on('change', history_change_cb);
    },

    get: function(name, defaultValue){
	/*jslint confusion: true */
	var me = this;
	var data;

	if (typeof me.UIState[name] != "undefined") {
	    data = { value: me.UIState[name] };
	} else {
	    data = me.callParent(arguments);
	    if (!data && name === 'GuiCap') {
		data = { vms: {}, storage: {}, access: {}, nodes: {}, dc: {} };
	    }
	}

	//console.log("GET " + name + " " + Ext.encode(data));
	return data;
    },

    clear: function(name){
	var me = this;

	if (typeof me.UIState[name] != "undefined") {
	    me.UIState[name] = null;
	}

	me.callParent(arguments);
    },

    set: function(name, value){
        var me = this;

	//console.log("SET " + name + " " + Ext.encode(value));
	if (typeof me.UIState[name] != "undefined") {
	    var newvalue = value ? value.value : null;
	    if (me.setHV(name, newvalue, false)) {
		var htext = me.encodeHToken(me.UIState);
		Ext.History.add(htext);
	    }
	} else {
	    me.callParent(arguments);
	}
    }
});/* Button features:
 * - observe selection changes to enable/disable the button using enableFn()
 * - pop up confirmation dialog using confirmMsg()
 */
Ext.define('PVE.button.Button', {
    extend: 'Ext.button.Button',
    alias: 'widget.pveButton',

    // the selection model to observe
    selModel: undefined,

    // if 'false' handler will not be called (button disabled)
    enableFn: function(record) { },

    // function(record) or text
    confirmMsg: false,

    // take special care in confirm box (select no as default).
    dangerous: false,

    initComponent: function() {
	/*jslint confusion: true */

        var me = this;

	if (me.handler) {
	    me.realHandler = me.handler;

	    me.handler = function(button, event) {
		var rec, msg;
		if (me.selModel) {
		    rec = me.selModel.getSelection()[0];
		    if (!rec || (me.enableFn(rec) === false)) {
			return;
		    }
		}

		if (me.confirmMsg) {
		    msg = me.confirmMsg;
		    if (Ext.isFunction(me.confirmMsg)) {
			msg = me.confirmMsg(rec);
		    }
		    Ext.MessageBox.defaultButton = me.dangerous ? 2 : 1;
		    Ext.Msg.show({
			title: gettext('Confirm'),
			icon: me.dangerous ? Ext.Msg.WARNING : Ext.Msg.QUESTION,
			msg: msg,
			buttons: Ext.Msg.YESNO,
			callback: function(btn) {
			    if (btn !== 'yes') {
				return;
			    }
			    me.realHandler(button, event, rec);
			}
		    });
		} else {
		    me.realHandler(button, event, rec);
		}
	    };
	}

	me.callParent();

	if (me.selModel) {

	    me.mon(me.selModel, "selectionchange", function() {
		var rec = me.selModel.getSelection()[0];
		if (!rec || (me.enableFn(rec) === false)) {
		    me.setDisabled(true);
		} else  {
		    me.setDisabled(false);
		}
	    });
	}
    }
});
Ext.define('PVE.qemu.SendKeyMenu', {
    extend: 'Ext.button.Button',
    alias: ['widget.pveQemuSendKeyMenu'],

    initComponent : function() {
        var me = this;

	if (!me.nodename) { 
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	var sendKey = function(key) {
	    PVE.Utils.API2Request({
		params: { key: key },
		url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + "/sendkey",
		method: 'PUT',
		waitMsgTarget: me,
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	Ext.apply(me, {
	    text: 'SendKey',
	    menu: new Ext.menu.Menu({
		height: 200,
		items: [
		    {
			text: 'Tab', handler: function() {
			    sendKey('tab');
			}
		    },
		    {
			text: 'Ctrl-Alt-Delete', handler: function() {
			    sendKey('ctrl-alt-delete');
			}
		    },
		    {
			text: 'Ctrl-Alt-Backspace', handler: function() {
			    sendKey('ctrl-alt-backspace');  
		    }
		    },
		    {
			text: 'Ctrl-Alt-F1', handler: function() {
			    sendKey('ctrl-alt-f1');
			}
		    },
		    {
			text: 'Ctrl-Alt-F2', handler: function() {
			    sendKey('ctrl-alt-f2');
			}
		    },
		    {
			text: 'Ctrl-Alt-F3', handler: function() {
			    sendKey('ctrl-alt-f3');
			}
		    },
		    {
			text: 'Ctrl-Alt-F4', handler: function() {
			sendKey('ctrl-alt-f4');
			}
		    },
		    {
			text: 'Ctrl-Alt-F5', handler: function() {
			    sendKey('ctrl-alt-f5');
			}
		    },
		    {
			text: 'Ctrl-Alt-F6', handler: function() {
			    sendKey('ctrl-alt-f6');
			}
		    },
		    {
			text: 'Ctrl-Alt-F7', handler: function() {
			    sendKey('ctrl-alt-f7');
			}
		    },
		    {
			text: 'Ctrl-Alt-F8', handler: function() {
			    sendKey('ctrl-alt-f8');
			}
		    },
		    {
			text: 'Ctrl-Alt-F9', handler: function() {
			    sendKey('ctrl-alt-f9');
			}
		    },
		    {
			text: 'Ctrl-Alt-F10', handler: function() {
			    sendKey('ctrl-alt-f10');
			}
		    },
		    {
			text: 'Ctrl-Alt-F11', handler: function() {
			    sendKey('ctrl-alt-f11');
			}
		    },
		    {
			text: 'Ctrl-Alt-F12', handler: function() {
			    sendKey('ctrl-alt-f12');
			}
		    }
		]
	    })
	});

	me.callParent();
    }
});
Ext.define('PVE.qemu.CmdMenu', {
    extend: 'Ext.menu.Menu',

    initComponent: function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var vmname = me.pveSelNode.data.name;

	var vm_command = function(cmd, params) {
	    PVE.Utils.API2Request({
		params: params,
		url: '/nodes/' + nodename + '/qemu/' + vmid + "/status/" + cmd,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	me.title = "VM " + vmid;

	me.items = [
	    {
		text: gettext('Start'),
		icon: '/pve2/images/start.png',
		handler: function() {
		    vm_command('start');
		}
	    },
	    { 
		text: gettext('Migrate'),
		icon: '/pve2/images/forward.png',
		handler: function() {
		    var win = Ext.create('PVE.window.Migrate', {
			vmtype: 'qemu',
			nodename: nodename,
			vmid: vmid
		    });
		    win.show();
		}
	    },
	    {
		text: gettext('Shutdown'),
		icon: '/pve2/images/stop.png',
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to shutdown VM {0}?"), vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}

			vm_command('shutdown');
		    });
		}			    
	    },
	    {
		text: gettext('Stop'),
		icon: '/pve2/images/gtk-stop.png',
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to stop VM {0}?"), vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}

			vm_command("stop");
		    });		   
		}
	    },
	    {
		text: gettext('Clone'),
		icon: '/pve2/images/forward.png',
		handler: function() {
		    var win = Ext.create('PVE.window.Clone', {
			nodename: nodename,
			vmid: vmid
		    });
		    win.show();
		}
	    },
	    {
		text: gettext('Convert to template'),
		icon: '/pve2/images/forward.png',
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to convert VM {0} into a template?"), vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}

			PVE.Utils.API2Request({
			     url: '/nodes/' + nodename + '/qemu/' + vmid + '/template',
			     method: 'POST',
			     failure: function(response, opts) {
				Ext.Msg.alert('Error', response.htmlStatus);
			     }
			});
		    });
		}
	    },
	    {
		text: gettext('Console'),
		icon: '/pve2/images/display.png',
		handler: function() {
		    PVE.Utils.openConoleWindow('kvm', vmid, nodename, vmname);
		}
	    }
	];

	me.callParent();
    }
});
Ext.define('PVE.qemu.TemplateMenu', {
    extend: 'Ext.menu.Menu',

    initComponent: function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var vmname = me.pveSelNode.data.name;

	var template = me.pveSelNode.data.template;

	var vm_command = function(cmd, params) {
	    PVE.Utils.API2Request({
		params: params,
		url: '/nodes/' + nodename + '/qemu/' + vmid + "/status/" + cmd,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	me.title = "VM " + vmid;

	me.items = [
	    {
		text: gettext('Migrate'),
		icon: '/pve2/images/forward.png',
		handler: function() {
		    var win = Ext.create('PVE.window.Migrate', {
			vmtype: 'qemu',
			nodename: nodename,
			vmid: vmid
		    });
		    win.show();
		}
	    },
	    {
		text: gettext('Clone'),
		icon: '/pve2/images/forward.png',
		handler: function() {
		    var win = Ext.create('PVE.window.Clone', {
			nodename: nodename,
			vmid: vmid,
			isTemplate: template
		    });
		    win.show();
		}
	    }
	];

	me.callParent();
    }
});
Ext.define('PVE.openvz.CmdMenu', {
    extend: 'Ext.menu.Menu',

    initComponent: function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var vmname = me.pveSelNode.data.name;

	var vm_command = function(cmd, params) {
	    PVE.Utils.API2Request({
		params: params,
		url: '/nodes/' + nodename + '/openvz/' + vmid + "/status/" + cmd,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	me.title = "CT " + vmid;

	me.items = [
	    {
		text: gettext('Start'),
		icon: '/pve2/images/start.png',
		handler: function() {
		    vm_command('start');
		}
	    },
	    { 
		text: gettext('Migrate'),
		icon: '/pve2/images/forward.png',
		handler: function() {
		    var win = Ext.create('PVE.window.Migrate', {
			vmtype: 'openvz',
			nodename: nodename,
			vmid: vmid
		    });
		    win.show();
		}
	    },
	    {
		text: gettext('Shutdown'),
		icon: '/pve2/images/stop.png',
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to shutdown VM {0}?"), vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}

			vm_command('shutdown');
		    });
		}			    
	    },
	    {
		text: gettext('Stop'),
		icon: '/pve2/images/gtk-stop.png',
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to stop VM {0}?"), vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}

			vm_command("stop");
		    });
		}
	    },
	    {
		text: gettext('Console'),
		icon: '/pve2/images/display.png',
		handler: function() {
		    PVE.Utils.openConoleWindow('openvz', vmid, nodename, vmname);
		}
	    }
	];

	me.callParent();
    }
});
PVE_vnc_console_event = function(appletid, action, err) {
    //console.log("TESTINIT param1 " + appletid + " action " + action);

    if (action === "error") {
	var compid = appletid.replace("-vncapp", "");
	var comp = Ext.getCmp(compid);

	if (!comp || !comp.vmid || !comp.toplevel) {
	    return;
	}

	// try to detect migrated VM
	PVE.Utils.API2Request({
	    url: '/cluster/resources',
	    method: 'GET',
	    success: function(response) {
		var list = response.result.data;
		Ext.Array.each(list, function(item) {
		    if (item.type === 'qemu' && item.vmid == comp.vmid) {
			if (item.node !== comp.nodename) {
			    //console.log("MOVED VM to node " + item.node);
			    comp.nodename = item.node;
			    comp.url = "/nodes/" + comp.nodename + "/" + item.type + "/" + comp.vmid + "/vncproxy";
			    //console.log("NEW URL " + comp.url);
			    comp.reloadApplet();
			}
			return false; // break
		    }
		});
	    }
	});
    }

    return;
    /*
      var el = Ext.get(appletid);
      if (!el)
      return;

      if (action === "close") {
      //	el.remove();
      } else if (action === "error") {
      //	console.log("TESTERROR: " + err);
      //	var compid = appletid.replace("-vncapp", "");
      //	var comp = Ext.getCmp(compid);
      }

      //Ext.get('mytestid').remove();
      */

};

Ext.define('PVE.VNCConsole', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.pveVNCConsole'],

    initComponent : function() {
	var me = this;

	if (!me.url) {
	    throw "no url specified";
	}

	var myid = me.id + "-vncapp";

	me.appletID = myid;

	var box = Ext.create('Ext.Component', {
	    border: false,
	    html: ""
	});

	var resize_window = function() {
	    //console.log("resize");

	    var applet = Ext.getDom(myid);
	    //console.log("resize " + myid + " " + applet);
	    
	    // try again when dom element is available
	    if (!(applet && Ext.isFunction(applet.getPreferredSize))) {
		return Ext.Function.defer(resize_window, 1000);
	    }

	    var tbar = me.getDockedItems("[dock=top]")[0];
	    var tbh = tbar ? tbar.getHeight() : 0;
	    var ps = applet.getPreferredSize();
	    var aw = ps.width;
	    var ah = ps.height;

	    if (aw < 640) { aw = 640; }
	    if (ah < 400) { ah = 400; }

	    var oh;
	    var ow;

	    //console.log("size0 " + aw + " " + ah + " tbh " + tbh);

	    if (window.innerHeight) {
		oh = window.innerHeight;
		ow = window.innerWidth;
	    } else if (document.documentElement && 
		       document.documentElement.clientHeight) {
		oh = document.documentElement.clientHeight;
		ow = document.documentElement.clientWidth;
	    } else if (document.body) {
		oh = document.body.clientHeight;
		ow = document.body.clientWidth;
	    }  else {
		throw "can't get window size";
	    }

	    Ext.fly(applet).setSize(aw, ah + tbh);

	    var offsetw = aw - ow;
	    var offseth = ah + tbh - oh;

	    if (offsetw !== 0 || offseth !== 0) {
		//console.log("try resize by " + offsetw + " " + offseth);
		try { window.resizeBy(offsetw, offseth); } catch (e) {}
	    }

	    Ext.Function.defer(resize_window, 1000);
	};

	var resize_box = function() {
	    var applet = Ext.getDom(myid);

	    if ((applet && Ext.isFunction(applet.getPreferredSize))) {
		var ps = applet.getPreferredSize();
		Ext.fly(applet).setSize(ps.width, ps.height);
	    }

	    Ext.Function.defer(resize_box, 1000);
	};

	var start_vnc_viewer = function(param) {
	    var cert = param.cert;
	    cert = cert.replace(/\n/g, "|");

	    box.update({
		id: myid,
		border: false,
		tag: 'applet',
		code: 'com.tigervnc.vncviewer.VncViewer',
		archive: '/vncterm/VncViewer.jar',
		// NOTE: set size to '100%' -  else resize does not work
		width: "100%",
		height: "100%", 
		cn: [
		    {tag: 'param', name: 'id', value: myid},
		    {tag: 'param', name: 'PORT', value: param.port},
		    {tag: 'param', name: 'PASSWORD', value: param.ticket},
		    {tag: 'param', name: 'USERNAME', value: param.user},
		    {tag: 'param', name: 'Show Controls', value: 'No'},
		    {tag: 'param', name: 'Offer Relogin', value: 'No'},
		    {tag: 'param', name: 'PVECert', value: cert}
		]
	    });
            if (me.toplevel) {
		Ext.Function.defer(resize_window, 1000);
            } else {
		Ext.Function.defer(resize_box, 1000);
            }
	};

	Ext.apply(me, {
	    layout: 'fit',
	    border: false,
	    autoScroll: me.toplevel ? false : true,
	    items: box,
	    reloadApplet: function() {
		PVE.Utils.API2Request({
		    url: me.url,
		    params: me.params,
		    method: me.method || 'POST',
		    failure: function(response, opts) {
			box.update(gettext('Error') + ' ' + response.htmlStatus);
		    },
		    success: function(response, opts) {
			start_vnc_viewer(response.result.data);
		    }
		});
	    }
	});

	me.callParent();

	if (me.toplevel) {
	    me.on("render", function() { me.reloadApplet();});
	} else {
	    me.on("show", function() { me.reloadApplet();});
	    me.on("hide", function() { box.update(""); });
	}
    }
});

Ext.define('PVE.KVMConsole', {
    extend: 'PVE.VNCConsole',
    alias: ['widget.pveKVMConsole'],

    initComponent : function() {
	var me = this;
 
	if (!me.nodename) { 
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	var vm_command = function(cmd, params, reload_applet) {
	    PVE.Utils.API2Request({
		params: params,
		url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + "/status/" + cmd,
		method: 'POST',
		waitMsgTarget: me,
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		},
		success: function() {
		    if (reload_applet) {
			Ext.Function.defer(me.reloadApplet, 1000, me);
		    }
		}
	    });
	};

	var tbar = [ 
	    { 
		text: gettext('Start'),
		handler: function() { 
		    vm_command("start", {}, 1);
		}
	    },
	    { 
		text: gettext('Shutdown'),
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to shutdown VM {0}?"), me.vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}
			vm_command('shutdown');
		    });
		}			    
	    }, 
	    { 
		text: gettext('Stop'),
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to stop VM {0}?"), me.vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}
			vm_command("stop");
		    }); 
		}
	    },
	    { 
		xtype: 'pveQemuSendKeyMenu',
		nodename: me.nodename,
		vmid: me.vmid
	    },
	    { 
		text: gettext('Reset'),
		handler: function() { 
		    var msg = Ext.String.format(gettext("Do you really want to reset VM {0}?"), me.vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}
			vm_command("reset");
		    });
		}
	    },
	    { 
		text: gettext('Suspend'),
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to suspend VM {0}?"), me.vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}
			vm_command("suspend");
		    }); 
		}
	    },
	    { 
		text: gettext('Resume'),
		handler: function() {
		    vm_command("resume"); 
		}
	    },
	    // Note: no migrate here, because we can't display migrate log
            { 
                text: gettext('Console'),
                handler: function() {
		    PVE.Utils.openConoleWindow('kvm', me.vmid, me.nodename, me.vmname);
		}
            },
            '->',
	    {
                text: gettext('Refresh'),
		handler: function() { 
		    var applet = Ext.getDom(me.appletID);
		    applet.sendRefreshRequest();
		}
	    },
	    {
                text: gettext('Reload'),
                handler: function () { 
		    me.reloadApplet(); 
		}
	    }
	];

	Ext.apply(me, {
	    tbar: tbar,
	    url: "/nodes/" + me.nodename + "/qemu/" + me.vmid + "/vncproxy"
	});

	me.callParent();
    }
});

Ext.define('PVE.OpenVZConsole', {
    extend: 'PVE.VNCConsole',
    alias: ['widget.pveOpenVZConsole'],

    initComponent : function() {
	var me = this;
 
	if (!me.nodename) { 
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	var vm_command = function(cmd, params, reload_applet) {
	    PVE.Utils.API2Request({
		params: params,
		url: '/nodes/' + me.nodename + '/openvz/' + me.vmid + "/status/" + cmd,
		waitMsgTarget: me,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		},
		success: function() {
		    if (reload_applet) {
			Ext.Function.defer(me.reloadApplet, 1000, me);
		    }
		}
	    });
	};

	var tbar = [ 
	    { 
		text: gettext('Start'),
		handler: function() { 
		    vm_command("start");
		}
	    },
	    { 
		text: gettext('Shutdown'),
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to shutdown VM {0}?"), me.vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}
			vm_command("shutdown");
		    }); 
		}
	    },
	    { 
		text: gettext('Stop'),
		handler: function() {
		    var msg = Ext.String.format(gettext("Do you really want to stop VM {0}?"), me.vmid);
		    Ext.Msg.confirm(gettext('Confirm'), msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}
			vm_command("stop");
		    }); 
		}
	    },
	    // Note: no migrate here, because we can't display migrate log
            '->',
	    {
                text: gettext('Refresh'),
		handler: function() { 
		    var applet = Ext.getDom(me.appletID);
		    applet.sendRefreshRequest();
		}
	    },
	    {
                text: gettext('Reload'),
                handler: function () { 
		    me.reloadApplet(); 
		}
	    }
	];

	Ext.apply(me, {
	    tbar: tbar,
	    url: "/nodes/" + me.nodename + "/openvz/" + me.vmid + "/vncproxy"
	});

	me.callParent();
    }
});

Ext.define('PVE.Shell', {
    extend: 'PVE.VNCConsole',
    alias: ['widget.pveShell'],

    ugradeSystem: false, // set to true to run "apt-get dist-upgrade"

    initComponent : function() {
	var me = this;
 
	if (!me.nodename) { 
	    throw "no node name specified";
	}

	var tbar = [ 
           '->',
	    {
                text: gettext('Refresh'),
		handler: function() { 
		    var applet = Ext.getDom(me.appletID);
		    applet.sendRefreshRequest();
		}
	    }
	];

	if (!me.ugradeSystem) {
	    // we dont want to restart the upgrade script
	    tbar.push([
		{
                    text: gettext('Reload'),
                    handler: function () { me.reloadApplet(); }
		}]);
	}

	tbar.push([
	    { 
		text: gettext('Shell'),
		handler: function() {
		    PVE.Utils.openConoleWindow('shell', undefined, me.nodename);
		}
	    }
	]);


	Ext.apply(me, {
	    tbar: tbar,
	    url: "/nodes/" + me.nodename + "/vncshell"
	});

	if (me.ugradeSystem) {
	    me.params = { upgrade: 1 };	    
	}

	me.callParent();
    }
});
Ext.define('PVE.data.TimezoneStore', {
    extend: 'Ext.data.Store',

    statics: {
	timezones: [
	    ['Africa/Abidjan'],
	    ['Africa/Accra'],
	    ['Africa/Addis_Ababa'],
	    ['Africa/Algiers'],
	    ['Africa/Asmara'],
	    ['Africa/Bamako'],
	    ['Africa/Bangui'],
	    ['Africa/Banjul'],
	    ['Africa/Bissau'],
	    ['Africa/Blantyre'],
	    ['Africa/Brazzaville'],
	    ['Africa/Bujumbura'],
	    ['Africa/Cairo'],
	    ['Africa/Casablanca'],
	    ['Africa/Ceuta'],
	    ['Africa/Conakry'],
	    ['Africa/Dakar'],
	    ['Africa/Dar_es_Salaam'],
	    ['Africa/Djibouti'],
	    ['Africa/Douala'],
	    ['Africa/El_Aaiun'],
	    ['Africa/Freetown'],
	    ['Africa/Gaborone'],
	    ['Africa/Harare'],
	    ['Africa/Johannesburg'],
	    ['Africa/Kampala'],
	    ['Africa/Khartoum'],
	    ['Africa/Kigali'],
	    ['Africa/Kinshasa'],
	    ['Africa/Lagos'],
	    ['Africa/Libreville'],
	    ['Africa/Lome'],
	    ['Africa/Luanda'],
	    ['Africa/Lubumbashi'],
	    ['Africa/Lusaka'],
	    ['Africa/Malabo'],
	    ['Africa/Maputo'],
	    ['Africa/Maseru'],
	    ['Africa/Mbabane'],
	    ['Africa/Mogadishu'],
	    ['Africa/Monrovia'],
	    ['Africa/Nairobi'],
	    ['Africa/Ndjamena'],
	    ['Africa/Niamey'],
	    ['Africa/Nouakchott'],
	    ['Africa/Ouagadougou'],
	    ['Africa/Porto-Novo'],
	    ['Africa/Sao_Tome'],
	    ['Africa/Tripoli'],
	    ['Africa/Tunis'],
	    ['Africa/Windhoek'],
	    ['America/Adak'],
	    ['America/Anchorage'],
	    ['America/Anguilla'],
	    ['America/Antigua'],
	    ['America/Araguaina'],
	    ['America/Argentina/Buenos_Aires'],
	    ['America/Argentina/Catamarca'],
	    ['America/Argentina/Cordoba'],
	    ['America/Argentina/Jujuy'],
	    ['America/Argentina/La_Rioja'],
	    ['America/Argentina/Mendoza'],
	    ['America/Argentina/Rio_Gallegos'],
	    ['America/Argentina/Salta'],
	    ['America/Argentina/San_Juan'],
	    ['America/Argentina/San_Luis'],
	    ['America/Argentina/Tucuman'],
	    ['America/Argentina/Ushuaia'],
	    ['America/Aruba'],
	    ['America/Asuncion'],
	    ['America/Atikokan'],
	    ['America/Bahia'],
	    ['America/Bahia_Banderas'],
	    ['America/Barbados'],
	    ['America/Belem'],
	    ['America/Belize'],
	    ['America/Blanc-Sablon'],
	    ['America/Boa_Vista'],
	    ['America/Bogota'],
	    ['America/Boise'],
	    ['America/Cambridge_Bay'],
	    ['America/Campo_Grande'],
	    ['America/Cancun'],
	    ['America/Caracas'],
	    ['America/Cayenne'],
	    ['America/Cayman'],
	    ['America/Chicago'],
	    ['America/Chihuahua'],
	    ['America/Costa_Rica'],
	    ['America/Cuiaba'],
	    ['America/Curacao'],
	    ['America/Danmarkshavn'],
	    ['America/Dawson'],
	    ['America/Dawson_Creek'],
	    ['America/Denver'],
	    ['America/Detroit'],
	    ['America/Dominica'],
	    ['America/Edmonton'],
	    ['America/Eirunepe'],
	    ['America/El_Salvador'],
	    ['America/Fortaleza'],
	    ['America/Glace_Bay'],
	    ['America/Godthab'],
	    ['America/Goose_Bay'],
	    ['America/Grand_Turk'],
	    ['America/Grenada'],
	    ['America/Guadeloupe'],
	    ['America/Guatemala'],
	    ['America/Guayaquil'],
	    ['America/Guyana'],
	    ['America/Halifax'],
	    ['America/Havana'],
	    ['America/Hermosillo'],
	    ['America/Indiana/Indianapolis'],
	    ['America/Indiana/Knox'],
	    ['America/Indiana/Marengo'],
	    ['America/Indiana/Petersburg'],
	    ['America/Indiana/Tell_City'],
	    ['America/Indiana/Vevay'],
	    ['America/Indiana/Vincennes'],
	    ['America/Indiana/Winamac'],
	    ['America/Inuvik'],
	    ['America/Iqaluit'],
	    ['America/Jamaica'],
	    ['America/Juneau'],
	    ['America/Kentucky/Louisville'],
	    ['America/Kentucky/Monticello'],
	    ['America/La_Paz'],
	    ['America/Lima'],
	    ['America/Los_Angeles'],
	    ['America/Maceio'],
	    ['America/Managua'],
	    ['America/Manaus'],
	    ['America/Marigot'],
	    ['America/Martinique'],
	    ['America/Matamoros'],
	    ['America/Mazatlan'],
	    ['America/Menominee'],
	    ['America/Merida'],
	    ['America/Mexico_City'],
	    ['America/Miquelon'],
	    ['America/Moncton'],
	    ['America/Monterrey'],
	    ['America/Montevideo'],
	    ['America/Montreal'],
	    ['America/Montserrat'],
	    ['America/Nassau'],
	    ['America/New_York'],
	    ['America/Nipigon'],
	    ['America/Nome'],
	    ['America/Noronha'],
	    ['America/North_Dakota/Center'],
	    ['America/North_Dakota/New_Salem'],
	    ['America/Ojinaga'],
	    ['America/Panama'],
	    ['America/Pangnirtung'],
	    ['America/Paramaribo'],
	    ['America/Phoenix'],
	    ['America/Port-au-Prince'],
	    ['America/Port_of_Spain'],
	    ['America/Porto_Velho'],
	    ['America/Puerto_Rico'],
	    ['America/Rainy_River'],
	    ['America/Rankin_Inlet'],
	    ['America/Recife'],
	    ['America/Regina'],
	    ['America/Resolute'],
	    ['America/Rio_Branco'],
	    ['America/Santa_Isabel'],
	    ['America/Santarem'],
	    ['America/Santiago'],
	    ['America/Santo_Domingo'],
	    ['America/Sao_Paulo'],
	    ['America/Scoresbysund'],
	    ['America/Shiprock'],
	    ['America/St_Barthelemy'],
	    ['America/St_Johns'],
	    ['America/St_Kitts'],
	    ['America/St_Lucia'],
	    ['America/St_Thomas'],
	    ['America/St_Vincent'],
	    ['America/Swift_Current'],
	    ['America/Tegucigalpa'],
	    ['America/Thule'],
	    ['America/Thunder_Bay'],
	    ['America/Tijuana'],
	    ['America/Toronto'],
	    ['America/Tortola'],
	    ['America/Vancouver'],
	    ['America/Whitehorse'],
	    ['America/Winnipeg'],
	    ['America/Yakutat'],
	    ['America/Yellowknife'],
	    ['Antarctica/Casey'],
	    ['Antarctica/Davis'],
	    ['Antarctica/DumontDUrville'],
	    ['Antarctica/Macquarie'],
	    ['Antarctica/Mawson'],
	    ['Antarctica/McMurdo'],
	    ['Antarctica/Palmer'],
	    ['Antarctica/Rothera'],
	    ['Antarctica/South_Pole'],
	    ['Antarctica/Syowa'],
	    ['Antarctica/Vostok'],
	    ['Arctic/Longyearbyen'],
	    ['Asia/Aden'],
	    ['Asia/Almaty'],
	    ['Asia/Amman'],
	    ['Asia/Anadyr'],
	    ['Asia/Aqtau'],
	    ['Asia/Aqtobe'],
	    ['Asia/Ashgabat'],
	    ['Asia/Baghdad'],
	    ['Asia/Bahrain'],
	    ['Asia/Baku'],
	    ['Asia/Bangkok'],
	    ['Asia/Beirut'],
	    ['Asia/Bishkek'],
	    ['Asia/Brunei'],
	    ['Asia/Choibalsan'],
	    ['Asia/Chongqing'],
	    ['Asia/Colombo'],
	    ['Asia/Damascus'],
	    ['Asia/Dhaka'],
	    ['Asia/Dili'],
	    ['Asia/Dubai'],
	    ['Asia/Dushanbe'],
	    ['Asia/Gaza'],
	    ['Asia/Harbin'],
	    ['Asia/Ho_Chi_Minh'],
	    ['Asia/Hong_Kong'],
	    ['Asia/Hovd'],
	    ['Asia/Irkutsk'],
	    ['Asia/Jakarta'],
	    ['Asia/Jayapura'],
	    ['Asia/Jerusalem'],
	    ['Asia/Kabul'],
	    ['Asia/Kamchatka'],
	    ['Asia/Karachi'],
	    ['Asia/Kashgar'],
	    ['Asia/Kathmandu'],
	    ['Asia/Kolkata'],
	    ['Asia/Krasnoyarsk'],
	    ['Asia/Kuala_Lumpur'],
	    ['Asia/Kuching'],
	    ['Asia/Kuwait'],
	    ['Asia/Macau'],
	    ['Asia/Magadan'],
	    ['Asia/Makassar'],
	    ['Asia/Manila'],
	    ['Asia/Muscat'],
	    ['Asia/Nicosia'],
	    ['Asia/Novokuznetsk'],
	    ['Asia/Novosibirsk'],
	    ['Asia/Omsk'],
	    ['Asia/Oral'],
	    ['Asia/Phnom_Penh'],
	    ['Asia/Pontianak'],
	    ['Asia/Pyongyang'],
	    ['Asia/Qatar'],
	    ['Asia/Qyzylorda'],
	    ['Asia/Rangoon'],
	    ['Asia/Riyadh'],
	    ['Asia/Sakhalin'],
	    ['Asia/Samarkand'],
	    ['Asia/Seoul'],
	    ['Asia/Shanghai'],
	    ['Asia/Singapore'],
	    ['Asia/Taipei'],
	    ['Asia/Tashkent'],
	    ['Asia/Tbilisi'],
	    ['Asia/Tehran'],
	    ['Asia/Thimphu'],
	    ['Asia/Tokyo'],
	    ['Asia/Ulaanbaatar'],
	    ['Asia/Urumqi'],
	    ['Asia/Vientiane'],
	    ['Asia/Vladivostok'],
	    ['Asia/Yakutsk'],
	    ['Asia/Yekaterinburg'],
	    ['Asia/Yerevan'],
	    ['Atlantic/Azores'],
	    ['Atlantic/Bermuda'],
	    ['Atlantic/Canary'],
	    ['Atlantic/Cape_Verde'],
	    ['Atlantic/Faroe'],
	    ['Atlantic/Madeira'],
	    ['Atlantic/Reykjavik'],
	    ['Atlantic/South_Georgia'],
	    ['Atlantic/St_Helena'],
	    ['Atlantic/Stanley'],
	    ['Australia/Adelaide'],
	    ['Australia/Brisbane'],
	    ['Australia/Broken_Hill'],
	    ['Australia/Currie'],
	    ['Australia/Darwin'],
	    ['Australia/Eucla'],
	    ['Australia/Hobart'],
	    ['Australia/Lindeman'],
	    ['Australia/Lord_Howe'],
	    ['Australia/Melbourne'],
	    ['Australia/Perth'],
	    ['Australia/Sydney'],
	    ['Europe/Amsterdam'],
	    ['Europe/Andorra'],
	    ['Europe/Athens'],
	    ['Europe/Belgrade'],
	    ['Europe/Berlin'],
	    ['Europe/Bratislava'],
	    ['Europe/Brussels'],
	    ['Europe/Bucharest'],
	    ['Europe/Budapest'],
	    ['Europe/Chisinau'],
	    ['Europe/Copenhagen'],
	    ['Europe/Dublin'],
	    ['Europe/Gibraltar'],
	    ['Europe/Guernsey'],
	    ['Europe/Helsinki'],
	    ['Europe/Isle_of_Man'],
	    ['Europe/Istanbul'],
	    ['Europe/Jersey'],
	    ['Europe/Kaliningrad'],
	    ['Europe/Kiev'],
	    ['Europe/Lisbon'],
	    ['Europe/Ljubljana'],
	    ['Europe/London'],
	    ['Europe/Luxembourg'],
	    ['Europe/Madrid'],
	    ['Europe/Malta'],
	    ['Europe/Mariehamn'],
	    ['Europe/Minsk'],
	    ['Europe/Monaco'],
	    ['Europe/Moscow'],
	    ['Europe/Oslo'],
	    ['Europe/Paris'],
	    ['Europe/Podgorica'],
	    ['Europe/Prague'],
	    ['Europe/Riga'],
	    ['Europe/Rome'],
	    ['Europe/Samara'],
	    ['Europe/San_Marino'],
	    ['Europe/Sarajevo'],
	    ['Europe/Simferopol'],
	    ['Europe/Skopje'],
	    ['Europe/Sofia'],
	    ['Europe/Stockholm'],
	    ['Europe/Tallinn'],
	    ['Europe/Tirane'],
	    ['Europe/Uzhgorod'],
	    ['Europe/Vaduz'],
	    ['Europe/Vatican'],
	    ['Europe/Vienna'],
	    ['Europe/Vilnius'],
	    ['Europe/Volgograd'],
	    ['Europe/Warsaw'],
	    ['Europe/Zagreb'],
	    ['Europe/Zaporozhye'],
	    ['Europe/Zurich'],
	    ['Indian/Antananarivo'],
	    ['Indian/Chagos'],
	    ['Indian/Christmas'],
	    ['Indian/Cocos'],
	    ['Indian/Comoro'],
	    ['Indian/Kerguelen'],
	    ['Indian/Mahe'],
	    ['Indian/Maldives'],
	    ['Indian/Mauritius'],
	    ['Indian/Mayotte'],
	    ['Indian/Reunion'],
	    ['Pacific/Apia'],
	    ['Pacific/Auckland'],
	    ['Pacific/Chatham'],
	    ['Pacific/Chuuk'],
	    ['Pacific/Easter'],
	    ['Pacific/Efate'],
	    ['Pacific/Enderbury'],
	    ['Pacific/Fakaofo'],
	    ['Pacific/Fiji'],
	    ['Pacific/Funafuti'],
	    ['Pacific/Galapagos'],
	    ['Pacific/Gambier'],
	    ['Pacific/Guadalcanal'],
	    ['Pacific/Guam'],
	    ['Pacific/Honolulu'],
	    ['Pacific/Johnston'],
	    ['Pacific/Kiritimati'],
	    ['Pacific/Kosrae'],
	    ['Pacific/Kwajalein'],
	    ['Pacific/Majuro'],
	    ['Pacific/Marquesas'],
	    ['Pacific/Midway'],
	    ['Pacific/Nauru'],
	    ['Pacific/Niue'],
	    ['Pacific/Norfolk'],
	    ['Pacific/Noumea'],
	    ['Pacific/Pago_Pago'],
	    ['Pacific/Palau'],
	    ['Pacific/Pitcairn'],
	    ['Pacific/Pohnpei'],
	    ['Pacific/Port_Moresby'],
	    ['Pacific/Rarotonga'],
	    ['Pacific/Saipan'],
	    ['Pacific/Tahiti'],
	    ['Pacific/Tarawa'],
	    ['Pacific/Tongatapu'],
	    ['Pacific/Wake'],
	    ['Pacific/Wallis']
	]
    },

    constructor: function(config) {
	var me = this;

	config = config || {};

	Ext.regModel('Timezone', {
	    fields: ['zone'],
	    proxy: {
		type: 'memory',
		reader: 'array'
	    }
	});

	Ext.apply(config, {
	    model: 'Timezone',
	    data: PVE.data.TimezoneStore.timezones
	});

	me.callParent([config]);	
    }
});/* A reader to store a single JSON Object (hash) into a storage.
 * Also accepts an array containing a single hash. 
 * So it can read:
 *
 * example1: { data: "xyz" }
 * example2: [ {  data: "xyz" } ]
 */

Ext.define('PVE.data.reader.JsonObject', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.jsonobject',
    
    root: 'data',
 
    constructor: function(config) {
        var me = this;

        Ext.apply(me, config || {});

	me.callParent([config]);
    },

    getResponseData: function(response) {
	var me = this;

	var data = [];
        try {
            var result = Ext.decode(response.responseText);
	    var root = me.getRoot(result);
	    var org_root = root;

	    if (Ext.isArray(org_root)) {
		if (org_root.length == 1) {
		    root = org_root[0];
		} else {
		    root = {};
		}
	    }

	    if (me.rows) {
		Ext.Object.each(me.rows, function(key, rowdef) {
		    if (Ext.isDefined(root[key])) {
			data.push({key: key, value: root[key]});
		    } else if (Ext.isDefined(rowdef.defaultValue)) {
			data.push({key: key, value: rowdef.defaultValue});
		    } else if (rowdef.required) {
			data.push({key: key, value: undefined});
		    }
		});
	    } else {
		Ext.Object.each(root, function(key, value) {
		    data.push({key: key, value: value });
		});
	    }
	}
        catch (ex) {
            Ext.Error.raise({
                response: response,
                json: response.responseText,
                parseError: ex,
                msg: 'Unable to parse the JSON returned by the server: ' + ex.toString()
            });
        }

	return data;
    }
});

Ext.define('PVE.RestProxy', {
    extend: 'Ext.data.RestProxy',
    alias : 'proxy.pve',

    constructor: function(config) {
	var me = this;

	config = config || {};

	Ext.applyIf(config, {
	    pageParam : null,
	    startParam: null,
	    limitParam: null,
	    groupParam: null,
	    sortParam: null,
	    filterParam: null,
	    noCache : false,
	    reader: {
		type: 'json',
		root: config.root || 'data'
	    },
	    afterRequest: function(request, success) {
		me.fireEvent('afterload', me, request, success);
		return;
	    }
	});

	me.callParent([config]); 
    }

}, function() {

    Ext.define('pve-domains', {
	extend: "Ext.data.Model",
	fields: [ 'realm', 'type', 'comment', 'default',
		  { 
		      name: 'descr',
		      // Note: We use this in the RealmComboBox.js
		      // (see Bug #125)
		      convert: function(value, record) {
			  var info = record.data;
			  var text;

			  if (value) {
			      return value;
			  }
			  // return realm if there is no comment
			  return info.comment || info.realm;
		      }
		  }
		],
	proxy: {
	    type: 'pve',
	    url: "/api2/json/access/domains"
	}
    });

    Ext.define('KeyValue', {
	extend: "Ext.data.Model",
	fields: [ 'key', 'value' ],
	idProperty: 'key'
    });

    Ext.define('pve-string-list', {
	extend: 'Ext.data.Model',
	fields:  [ 'n', 't' ],
	idProperty: 'n'
    });

    Ext.define('pve-tasks', {
	extend: 'Ext.data.Model',
	fields:  [ 
	    { name: 'starttime', type : 'date', dateFormat: 'timestamp' }, 
	    { name: 'endtime', type : 'date', dateFormat: 'timestamp' }, 
	    { name: 'pid', type: 'int' },
	    'node', 'upid', 'user', 'status', 'type', 'id'
	],
	idProperty: 'upid'
    });

    Ext.define('pve-cluster-log', {
	extend: 'Ext.data.Model',
	fields:  [ 
	    { name: 'uid' , type: 'int' },
	    { name: 'time', type : 'date', dateFormat: 'timestamp' }, 
	    { name: 'pri', type: 'int' },
	    { name: 'pid', type: 'int' },
	    'node', 'user', 'tag', 'msg',
	    {
		name: 'id',
		convert: function(value, record) {
		    var info = record.data;
		    var text;

		    if (value) {
			return value;
		    }
		    // compute unique ID
		    return info.uid + ':' + info.node;
		}
	    }
	],
	idProperty: 'id'
    });
});
// Serialize load (avoid too many parallel connections)
Ext.define('PVE.data.UpdateQueue', {
    singleton: true,

    constructor : function(){
        var me = this;

	var queue = [];
	var queue_idx = {};

	var idle = true;

	var start_update = function() {
	    if (!idle) {
		return;
	    }

	    var store = queue.shift();
	    if (!store) {
		return;
	    }

	    queue_idx[store.storeid] = null;

	    idle = false;
	    store.load({
		callback: function(records, operation, success) {
		    idle = true;
		    start_update();
		}
	    });
	};

	Ext.apply(me, {
	    queue: function(store) {
		if (!store.storeid) {
		    throw "unable to queue store without storeid";
		}
		if (!queue_idx[store.storeid]) {
		    queue_idx[store.storeid] = store;
		    queue.push(store);
		}
		start_update();
	    }
	});
    }
});
Ext.define('PVE.data.UpdateStore', {
    extend: 'Ext.data.Store',

    constructor: function(config) {
	var me = this;

	config = config || {};

	if (!config.interval) {
	    config.interval = 3000;
	}

	if (!config.storeid) {
	    throw "no storeid specified";
	}

	var load_task = new Ext.util.DelayedTask();

	var run_load_task = function() {
	    if (PVE.Utils.authOK()) {
		PVE.data.UpdateQueue.queue(me);
		load_task.delay(config.interval, run_load_task);
	    } else {
		load_task.delay(200, run_load_task);
	    }
	};

	Ext.apply(config, {
	    startUpdate: function() {
		run_load_task();
	    },
	    stopUpdate: function() {
		load_task.cancel();
	    }
	});

	me.callParent([config]);

	me.on('destroy', function() {
	    load_task.cancel();
	});
    }
});
/* Config properties:
 * rstore: A storage to track changes
 * Only works if rstore has a model and use 'idProperty'
 */
Ext.define('PVE.data.DiffStore', {
    extend: 'Ext.data.Store',

    constructor: function(config) {
	var me = this;

	config = config || {};

	if (!config.rstore) {
	    throw "no rstore specified";
	}

	if (!config.rstore.model) {
	    throw "no rstore model specified";
	}

	var rstore = config.rstore;

	Ext.apply(config, {
	    model: rstore.model,
	    proxy: { type: 'memory' }
	});

	me.callParent([config]);

	var first_load = true;

	var cond_add_item = function(data, id) {
	    var olditem = me.getById(id);
	    if (olditem) {
		olditem.beginEdit();
		me.model.prototype.fields.eachKey(function(field) {
		    if (olditem.data[field] !== data[field]) {
			olditem.set(field, data[field]);
		    }
		});
		olditem.endEdit(true);
		olditem.commit(); 
	    } else {
		var newrec = Ext.ModelMgr.create(data, me.model, id);
		var pos = (me.appendAtStart && !first_load) ? 0 : me.data.length;
		me.insert(pos, newrec);
	    }
	};

	me.mon(rstore, 'load', function(s, records, success) {

	    if (!success) {
		return;
	    }

	    me.suspendEvents();

	    // remove vanished items
	    (me.snapshot || me.data).each(function(olditem) {
		var item = rstore.getById(olditem.getId());
		if (!item) {
		    me.remove(olditem);
		}
	    });
		    
	    rstore.each(function(item) {
		cond_add_item(item.data, item.getId());
	    });

	    me.filter();

	    first_load = false;

	    me.resumeEvents();
	    me.fireEvent('datachanged', me);
	});
    }
});
Ext.define('PVE.data.ObjectStore',  {
    extend: 'PVE.data.UpdateStore',

    constructor: function(config) {
	var me = this;

        config = config || {};

	if (!config.storeid) {
	    config.storeid =  'pve-store-' + (++Ext.idSeed);
	}

        Ext.applyIf(config, {
	    model: 'KeyValue',
            proxy: {
                type: 'pve',
		url: config.url,
		extraParams: config.extraParams,
                reader: {
		    type: 'jsonobject',
		    rows: config.rows
		}
            }
        });

        me.callParent([config]);
    }
});
Ext.define('PVE.data.ResourceStore', {
    extend: 'PVE.data.UpdateStore',
    singleton: true,

    findVMID: function(vmid) {
	var me = this, i;
	
	return (me.findExact('vmid', parseInt(vmid, 10)) >= 0);
    },
 
    constructor: function(config) {
	// fixme: how to avoid those warnings
	/*jslint confusion: true */

	var me = this;

	config = config || {};

	var field_defaults = {
	    type: {
		header: gettext('Type'),
		type: 'text',
		renderer: PVE.Utils.render_resource_type,
		sortable: true,
		hideable: false,
		width: 80
	    },
	    id: {
		header: 'ID',
		type: 'text',
		hidden: true,
		sortable: true,
		width: 80
	    },
	    running: {
		header: gettext('Online'),
		type: 'boolean',
		hidden: true,
		convert: function(value, record) {
		    var info = record.data;
		    if (info.type === 'qemu' || info.type === 'openvz' || info.type === 'node') {
			return (Ext.isNumeric(info.uptime) && (info.uptime > 0));
		    } else {
			return false;
		    }
		}
	    },
	    text: {
		header: gettext('Description'),
		type: 'text',
		sortable: true,
		width: 200,
		convert: function(value, record) {
		    var info = record.data;
		    var text;

		    if (value) {
			return value;
		    }

		    if (info.type === 'node') {
			text = info.node;
		    } else if (info.type === 'pool') {
			text = info.pool;
		    } else if (info.type === 'storage') {
			text = info.storage + ' (' + info.node + ')';
		    } else if (info.type === 'qemu' || info.type === 'openvz') {
			text = String(info.vmid);
			if (info.name) {
			    text += " (" + info.name + ')';
			}
		    } else {
			text = info.id;
		    }
		    return text;
		}
	    },
	    vmid: {
		header: 'VMID',
		type: 'integer',
		hidden: true,
		sortable: true,
		width: 80
	    },
	    name: {
		header: gettext('Name'),
		hidden: true,
		sortable: true,
		type: 'text'
	    },
	    disk: {
		header: gettext('Disk usage'),
		type: 'integer',
		renderer: PVE.Utils.render_disk_usage,
		sortable: true,
		width: 100
	    },
	    maxdisk: {
		header: gettext('Disk size'),
		type: 'integer',
		renderer: PVE.Utils.render_size,
		sortable: true,
		hidden: true,
		width: 100
	    },
	    mem: {
		header: gettext('Memory usage'),
		type: 'integer',
		renderer: PVE.Utils.render_mem_usage,
		sortable: true,
		width: 100
	    },
	    maxmem: {
		header: gettext('Memory size'),
		type: 'integer',
		renderer: PVE.Utils.render_size,
		hidden: true,
		sortable: true,
		width: 100
	    },
	    cpu: {
		header: gettext('CPU usage'),
		type: 'float',
		renderer: PVE.Utils.render_cpu,
		sortable: true,
		width: 100
	    },
	    maxcpu: {
		header: 'maxcpu',
		type: 'integer',
		hidden: true,
		sortable: true,
		width: 60
	    },
	    diskread: {
		header: 'Total Disk Read',
		type: 'integer',
		hidden: true,
		sortable: true,
		renderer: PVE.Utils.format_size,
		width: 100
	    },
	    diskwrite: {
		header: 'Total Disk Write',
		type: 'integer',
		hidden: true,
		sortable: true,
		renderer: PVE.Utils.format_size,
		width: 100
	    },
	    netin: {
		header: 'Total NetIn',
		type: 'integer',
		hidden: true,
		sortable: true,
		renderer: PVE.Utils.format_size,
		width: 100
	    },
	    netout: {
		header: 'Total NetOut',
		type: 'integer',
		hidden: true,
		sortable: true,
		renderer: PVE.Utils.format_size,
		width: 100
	    },
	    template: {
		header: 'template',
		type: 'integer',
		hidden: true,
		sortable: true,
		width: 60
	    },
	    uptime: {
		header: gettext('Uptime'),
		type: 'integer',
		renderer: PVE.Utils.render_uptime,
		sortable: true,
		width: 110
	    }, 
	    node: {
		header: gettext('Node'),
		type: 'text',
		hidden: true,
		sortable: true,
		width: 110
	    },
	    storage: {
		header: gettext('Storage'),
		type: 'text',
		hidden: true,
		sortable: true,
		width: 110
	    },
	    pool: {
		header: gettext('Pool'),
		type: 'text',
		hidden: true,
		sortable: true,
		width: 110
	    }
	};

	var fields = [];
	var fieldNames = [];
	Ext.Object.each(field_defaults, function(key, value) {
	    if (!Ext.isDefined(value.convert)) {
		fields.push({name: key, type: value.type});
		fieldNames.push(key);
	    } else if (key === 'text' || key === 'running') { 
		fields.push({name: key, type: value.type, convert: value.convert});
		fieldNames.push(key);
	    }		
	});

	Ext.define('PVEResources', {
	    extend: "Ext.data.Model",
	    fields: fields,
	    proxy: {
		type: 'pve',
		url: '/api2/json/cluster/resources'
	    }
	});

	Ext.define('PVETree', {
	    extend: "Ext.data.Model",
	    fields: fields,
	    proxy: { type: 'memory' }
	});

	Ext.apply(config, {
	    storeid: 'PVEResources',
	    model: 'PVEResources',
	    autoDestory: false,
	    defaultColums: function() {
		var res = [];
		Ext.Object.each(field_defaults, function(field, info) {
		    var fi = Ext.apply({ dataIndex: field }, info);
		    res.push(fi);
		});
		return res;
	    },
	    fieldNames: fieldNames
	});

	me.callParent([config]);
    }
});
Ext.define('PVE.form.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: ['widget.pvecheckbox'],

    defaultValue: undefined,

    deleteDefaultValue: false,
    deleteEmpty: false,
 
    inputValue: '1',

    height: 22, // hack: set same height as text fields

    getSubmitData: function() {
        var me = this,
            data = null,
            val;
        if (!me.disabled && me.submitValue) {
            val = me.getSubmitValue();
            if (val !== null) {
                data = {};
		if ((val == me.defaultValue) && me.deleteDefaultValue) {
		    data['delete'] = me.getName();
		} else {
                    data[me.getName()] = val;
		}
            } else if (me.deleteEmpty) {
               data = {};
               data['delete'] = me.getName();
	    }
        }
        return data;
    },

    // also accept integer 1 as true
    setRawValue: function(value) {
	var me = this;

	if (value === 1) {
            me.callParent([true]);
	} else {
            me.callParent([value]);
	}
    }

});Ext.define('PVE.form.Textfield', {
    extend: 'Ext.form.field.Text',
    alias: ['widget.pvetextfield'],

    skipEmptyText: true,
    
    deleteEmpty: false,
    
    getSubmitData: function() {
        var me = this,
            data = null,
            val;
        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            val = me.getSubmitValue();
            if (val !== null) {
                data = {};
                data[me.getName()] = val;
            } else if (me.deleteEmpty) {
		data = {};
                data['delete'] = me.getName();
	    }
        }
        return data;
    },

    getSubmitValue: function() {
	var me = this;

        var value = this.processRawValue(this.getRawValue());
	if (value !== '') {
	    return value;
	}

	return me.skipEmptyText ? null: value; 
    }
});Ext.define('PVE.form.RRDTypeSelector', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.pveRRDTypeSelector'],
  
    initComponent: function() {
        var me = this;
	
	var store = new Ext.data.ArrayStore({
            fields: [ 'id', 'timeframe', 'cf', 'text' ],
            data : [
		[ 'hour', 'hour', 'AVERAGE', "Hour (average)" ],
		[ 'hourmax', 'hour', 'MAX', "Hour (max)" ],
		[ 'day', 'day', 'AVERAGE', "Day (average)" ],
		[ 'daymax', 'day', 'MAX', "Day (max)" ],
		[ 'week', 'week', 'AVERAGE', "Week (average)" ],
		[ 'weekmax', 'week', 'MAX', "Week (max)" ],
		[ 'month', 'month', 'AVERAGE', "Month (average)" ],
		[ 'monthmax', 'month', 'MAX', "Month (max)" ],
		[ 'year', 'year', 'AVERAGE', "Year (average)" ],
		[ 'yearmax', 'year', 'MAX', "Year (max)" ]
	    ]
	});

	Ext.apply(me, {
            store: store,
            displayField: 'text',
	    valueField: 'id',
	    editable: false,
            queryMode: 'local',
	    value: 'hour',
	    getState: function() {
		var ind = store.findExact('id', me.getValue());
		var rec = store.getAt(ind);
		if (!rec) {
		    return;
		}
		return { 
		    id: rec.data.id,
		    timeframe: rec.data.timeframe,
		    cf: rec.data.cf
		};
	    },
	    applyState : function(state) {
		if (state && state.id) {
		    me.setValue(state.id);
		}
	    },
	    stateEvents: [ 'select' ],
	    stateful: true,
	    id: 'pveRRDTypeSelection'        
	});

	me.callParent();

	var statechange = function(sp, key, value) {
	    if (key === me.id) {
		me.applyState(value);
	    }
	};

	var sp = Ext.state.Manager.getProvider();
	me.mon(sp, 'statechange', statechange, me);
    }
});

Ext.define('PVE.form.ComboGrid', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.PVE.form.ComboGrid'],

    // this value is used as default value after load()
    preferredValue: undefined,

    computeHeight: function() {
	var me = this;
	var lh = PVE.Utils.gridLineHeigh();
	var count = me.store.getCount();
	return (count > 10) ? 10*lh : 26+count*lh;
    },

    // hack: allow to select empty value
    // seems extjs does not allow that when 'editable == false'
    onKeyUp: function(e, t) {
        var me = this;
        var key = e.getKey();

        if (!me.editable && me.allowBlank && !me.multiSelect &&
	    (key == e.BACKSPACE || key == e.DELETE)) {
	    me.setValue('');
	}

        me.callParent(arguments);	
    },

    // copied from ComboBox 
    createPicker: function() {
        var me = this,
        picker,
        menuCls = Ext.baseCSSPrefix + 'menu',

        opts = Ext.apply({
            selModel: {
                mode: me.multiSelect ? 'SIMPLE' : 'SINGLE'
            },
            floating: true,
            hidden: true,
            ownerCt: me.ownerCt,
            cls: me.el.up('.' + menuCls) ? menuCls : '',
            store: me.store,
            displayField: me.displayField,
            focusOnToFront: false,
	    height: me.computeHeight(),
            pageSize: me.pageSize
        }, me.listConfig, me.defaultListConfig);

	// NOTE: we simply use a grid panel
        //picker = me.picker = Ext.create('Ext.view.BoundList', opts);
	picker = me.picker = Ext.create('Ext.grid.Panel', opts);

	// pass getNode() to the view
	picker.getNode = function() {
	    picker.getView().getNode(arguments);
	};

        me.mon(picker, {
            itemclick: me.onItemClick,
            refresh: me.onListRefresh,
	    show: function() {
		picker.setHeight(me.computeHeight());
		me.syncSelection();
	    },
            scope: me
        });

        me.mon(picker.getSelectionModel(), 'selectionchange', me.onListSelectionChange, me);

        return picker;
    },

    initComponent: function() {
	var me = this;

	Ext.apply(me, {
	    queryMode: 'local',
	    editable: false,
	    matchFieldWidth: false
	});

	Ext.applyIf(me, { value: ''}); // hack: avoid ExtJS validate() bug

	Ext.applyIf(me.listConfig, { width: 400 });

        me.callParent();

	me.store.on('beforeload', function() {	 
	    if (!me.isDisabled()) {
		me.setDisabled(true);
		me.enableAfterLoad = true;
	    }
	});

	// hack: autoSelect does not work
	me.store.on('load', function(store, r, success, o) {
	    if (success) {
		me.clearInvalid();
		
		if (me.enableAfterLoad) {
		    delete me.enableAfterLoad;
		    me.setDisabled(false);
		}

		var def = me.getValue() || me.preferredValue;
		if (def) {
		    me.setValue(def, true); // sync with grid
		}
		var found = false;
		if (def) {
		    if (Ext.isArray(def)) {
			Ext.Array.each(def, function(v) {
			    if (store.findRecord(me.valueField, v)) {
				found = true;
				return false; // break
			    }
			});
		    } else {
			found = store.findRecord(me.valueField, def);
		    }
		}

		if (!found) {
		    var rec = me.store.first();
		    if (me.autoSelect && rec && rec.data) {
			def = rec.data[me.valueField];
			me.setValue(def, true);
		    } else {
			me.setValue('', true);
		    }
		}
	    }
	});
    }
});
Ext.define('PVE.form.KVComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pveKVComboBox',

    deleteEmpty: true,
    
    getSubmitData: function() {
        var me = this,
            data = null,
            val;
        if (!me.disabled && me.submitValue) {
            val = me.getSubmitValue();
            if (val !== null && val !== '') {
                data = {};
                data[me.getName()] = val;
            } else if (me.deleteEmpty) {
		data = {};
                data['delete'] = me.getName();
	    }
        }
        return data;
    },

    initComponent: function() {
	var me = this;

	me.store = Ext.create('Ext.data.ArrayStore', {
	    model: 'KeyValue',
	    data : me.data
	});

	Ext.apply(me, {
	    displayField: 'value',
	    valueField: 'key',
	    queryMode: 'local',
	    editable: false
	});

	me.callParent();
    }
});
// boolean type including 'Default' (delete property from file)
Ext.define('PVE.form.Boolean', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.booleanfield'],
  
    initComponent: function() {
	var me = this;

	me.data = [
	    ['', gettext('Default')],
	    [1, gettext('Yes')],
	    [0, gettext('No')]
	];

	me.callParent();
    }
});
Ext.define('PVE.form.CompressionSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.pveCompressionSelector'],
  
    initComponent: function() {
	var me = this;

        me.data = [ 
	    ['', gettext('none')],
	    ['lzo', 'LZO (' + gettext('fast') + ')'],
	    ['gzip', 'GZIP (' + gettext('good') + ')']
	];

	me.callParent();
    }
});
Ext.define('PVE.form.PoolSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.pvePoolSelector'],

    allowBlank: false,

    initComponent: function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-pools'
	});

	Ext.apply(me, {
	    store: store,
	    autoSelect: false,
	    valueField: 'poolid',
	    displayField: 'poolid',
            listConfig: {
		columns: [
		    {
			header: gettext('Pool'),
			sortable: true,
			dataIndex: 'poolid',
			flex: 1
		    },
		    {
			id: 'comment',
			header: 'Comment',
			sortable: false,
			dataIndex: 'comment',
			flex: 1
		    }
		]
	    }
	});

        me.callParent();

	store.load();
    }

}, function() {

    Ext.define('pve-pools', {
	extend: 'Ext.data.Model',
	fields: [ 'poolid', 'comment' ],
	proxy: {
            type: 'pve',
	    url: "/api2/json/pools"
	},
	idProperty: 'poolid'
    });

});
Ext.define('PVE.form.GroupSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.pveGroupSelector'],

    allowBlank: false,

    initComponent: function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-groups'
	});

	Ext.apply(me, {
	    store: store,
	    autoSelect: false,
	    valueField: 'groupid',
	    displayField: 'groupid',
            listConfig: {
		columns: [
		    {
			header: gettext('Group'),
			sortable: true,
			dataIndex: 'groupid',
			flex: 1
		    },
		    {
			id: 'comment',
			header: 'Comment',
			sortable: false,
			dataIndex: 'comment',
			flex: 1
		    }
		]
	    }
	});

        me.callParent();

	store.load();
    }

}, function() {

    Ext.define('pve-groups', {
	extend: 'Ext.data.Model',
	fields: [ 'groupid', 'comment' ],
	proxy: {
            type: 'pve',
	    url: "/api2/json/access/groups"
	},
	idProperty: 'groupid'
    });

});
Ext.define('PVE.form.UserSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.pveUserSelector'],

    initComponent: function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-users'
	});

	var render_full_name = function(firstname, metaData, record) {

	    var first = firstname || '';
	    var last = record.data.lastname || '';
	    return first + " " + last;
	};

	Ext.apply(me, {
	    store: store,
	    allowBlank: false,
	    autoSelect: false,
	    valueField: 'userid',
	    displayField: 'userid',
            listConfig: {
		columns: [
		    {
			header: gettext('User'),
			sortable: true,
			dataIndex: 'userid',
			flex: 1
		    },
		    {
			header: 'Name',
			sortable: true,
			renderer: render_full_name,
			dataIndex: 'firstname',
			flex: 1
		    },
		    {
			id: 'comment',
			header: 'Comment',
			sortable: false,
			dataIndex: 'comment',
			flex: 1
		    }
		]
	    }
	});

        me.callParent();

	store.load({ params: { enabled: 1 }});
    }

}, function() {

    Ext.define('pve-users', {
	extend: 'Ext.data.Model',
	fields: [ 
	    'userid', 'firstname', 'lastname' , 'email', 'comment',
	    { type: 'boolean', name: 'enable' }, 
	    { type: 'date', dateFormat: 'timestamp', name: 'expire' }
	],
	proxy: {
            type: 'pve',
	    url: "/api2/json/access/users"
	},
	idProperty: 'userid'
    });

});


Ext.define('PVE.form.RoleSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.pveRoleSelector'],

    initComponent: function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-roles'
	});

	Ext.apply(me, {
	    store: store,
	    allowBlank: false,
	    autoSelect: false,
	    valueField: 'roleid',
	    displayField: 'roleid',
            listConfig: {
		columns: [
		    {
			header: gettext('Role'),
			sortable: true,
			dataIndex: 'roleid',
			flex: 1
		    }
		]
	    }
	});

        me.callParent();

	store.load();
    }

}, function() {

    Ext.define('pve-roles', {
	extend: 'Ext.data.Model',
	fields: [ 'roleid', 'privs' ],
	proxy: {
            type: 'pve',
	    url: "/api2/json/access/roles"
	},
	idProperty: 'roleid'
    });

});
Ext.define('PVE.form.VMIDSelector', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.pveVMIDSelector',

    allowBlank: false,
  
    minValue: 100,

    maxValue: 999999999,

    validateExists: undefined,

    loadNextFreeVMID: false,

    initComponent: function() {
        var me = this;

	Ext.applyIf(me, {
	    fieldLabel: 'VM ID',
	    listeners: {
		'change': function(field, newValue, oldValue) {
		    if (!Ext.isDefined(me.validateExists)) {
			return;
		    }
		    PVE.Utils.API2Request({
			params: { vmid: newValue },
			url: '/cluster/nextid',
			method: 'GET',
			success: function(response, opts) {
			    if (me.validateExists === true) {
				me.markInvalid("This VM ID does not exists.");
			    }
			},
			failure: function(response, opts) {
			    if (me.validateExists === false) {
				me.markInvalid("This VM ID is already in use.");
			    }
			}
		    });
		}
	    }
	});

        me.callParent();

	if (me.loadNextFreeVMID) {
	    PVE.Utils.API2Request({
		url: '/cluster/nextid',
		method: 'GET',
		success: function(response, opts) {
		    me.setRawValue(response.result.data);
		}
	    });
	}
    }
});
Ext.define('PVE.form.NetworkCardSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.PVE.form.NetworkCardSelector'],
  
    initComponent: function() {
	var me = this;

        me.data = [ 
	    ['e1000', 'Intel E1000'],
	    ['virtio', 'VirtIO (paravirtualized)'],
	    ['rtl8139', 'Realtec RTL8139']
	];
 
	me.callParent();
    }
});
Ext.define('PVE.form.DiskFormatSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.PVE.form.DiskFormatSelector'],
  
    initComponent: function() {
	var me = this;

        me.data = [ 
	    ['raw', 'Raw disk image (raw)'], 
	    ['qcow2', 'QEMU image format (qcow2)'],
	    ['vmdk', 'VMware image format (vmdk)']
	];

	me.callParent();
    }
});
Ext.define('PVE.form.BusTypeSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.PVE.form.BusTypeSelector'],
  
    noVirtIO: false,

    noScsi: false,

    initComponent: function() {
	var me = this;

	me.data = [['ide', 'IDE'], ['sata', 'SATA']];

	if (!me.noVirtIO) {
	    me.data.push(['virtio', 'VIRTIO']);
	}

	if (!me.noScsi) {
	    me.data.push(['scsi', 'SCSI']);
	}

	me.callParent();
    }
});
Ext.define('PVE.form.ControllerSelector', {
    extend: 'Ext.form.FieldContainer',
    alias: ['widget.PVE.form.ControllerSelector'],
   
    statics: {
	maxIds: {
	    ide: 3,
	    sata: 5,
	    virtio: 15,
	    scsi: 13
	}
    },

    noVirtIO: false,

    noScsi: false,

    vmconfig: {}, // used to check for existing devices

    setVMConfig: function(vmconfig, autoSelect) {
	var me = this;

	me.vmconfig = Ext.apply({}, vmconfig);
	if (autoSelect) {
	    var clist = ['ide', 'virtio', 'scsi', 'sata'];
	    if (autoSelect === 'cdrom') {
		clist = ['ide', 'scsi', 'sata'];
		if (!Ext.isDefined(me.vmconfig.ide2)) {
		    me.down('field[name=controller]').setValue('ide');
		    me.down('field[name=deviceid]').setValue(2);
		    return;
		}
	    } else if (me.vmconfig.ostype === 'l26') {
		clist = ['virtio', 'ide', 'scsi', 'sata'];
	    }

	    Ext.Array.each(clist, function(controller) {
		var confid, i;
		if ((controller === 'virtio' && me.noVirtIO) ||
		    (controller === 'scsi' && me.noScsi)) {
		    return; //continue
		}
		me.down('field[name=controller]').setValue(controller);
		for (i = 0; i <= PVE.form.ControllerSelector.maxIds[controller]; i++) {
		    confid = controller + i.toString();
		    if (!Ext.isDefined(me.vmconfig[confid])) {
			me.down('field[name=deviceid]').setValue(i);
			return false; // break
		    }
		}
	    });
	}
	me.down('field[name=deviceid]').validate();
    },

    initComponent: function() {
	var me = this;

	Ext.apply(me, {
	    fieldLabel: 'Bus/Device',
	    layout: 'hbox',
	    height: 22, // hack: set to same height as other fields
	    defaults: {
                flex: 1,
                hideLabel: true
	    },
	    items: [
		{
		    xtype: 'PVE.form.BusTypeSelector',
		    name: 'controller',
		    value: 'ide',
		    noVirtIO: me.noVirtIO,
		    noScsi: me.noScsi,
		    allowBlank: false,
		    listeners: {
			change: function(t, value) {
			    if (!me.rendered || !value) {
				return;
			    }
			    var field = me.down('field[name=deviceid]');
			    field.setMaxValue(PVE.form.ControllerSelector.maxIds[value]);
			    field.validate();
			}
		    }
		},
		{
		    xtype: 'numberfield',
		    name: 'deviceid',
		    minValue: 0,
		    maxValue: PVE.form.ControllerSelector.maxIds.ide,
		    value: '0',
		    validator: function(value) {
			/*jslint confusion: true */
			if (!me.rendered) {
			    return;
			}
			var field = me.down('field[name=controller]');
			var controller = field.getValue();
			var confid = controller + value;
			if (Ext.isDefined(me.vmconfig[confid])) {
			    return "This device is already in use.";
			}
			return true;
		    }
		}
	    ]
	});

	me.callParent();
    }
});   Ext.define('PVE.form.RealmComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.pveRealmComboBox'],

    initComponent: function() {
	var me = this;

	var stateid = 'pveloginrealm';

	var realmstore = Ext.create('Ext.data.Store', {
	    model: 'pve-domains',
	    autoDestory: true
	});

	Ext.apply(me, {
	    fieldLabel: 'Realm',
	    name: 'realm',
	    store: realmstore,
	    queryMode: 'local',
	    allowBlank: false,
	    forceSelection: true,
	    autoSelect: false,
	    triggerAction: 'all',
	    valueField: 'realm',
	    displayField: 'descr',
	    getState: function() {
		return { value: this.getValue() };
	    },
	    applyState : function(state) {
		if (state && state.value) {
		    this.setValue(state.value);
		}
	    },
	    stateEvents: [ 'select' ],
	    stateful: true,
	    id: stateid, // fixme: remove (Stateful does not work without)  
	    stateID: stateid
	});

        me.callParent();

	realmstore.load({
	    callback: function(r, o, success) {
		if (success) {
		    var def = me.getValue();
		    if (!def || !realmstore.findRecord('realm', def)) {
			def = 'pam';
			Ext.each(r, function(record) {
			    if (record.data && record.data["default"]) { 
				def = record.data.realm;
			    }
			});
		    }
		    if (def) {
			me.setValue(def);
		    }
		}
	    }
	});
    }
});Ext.define('PVE.form.BondModeSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.bondModeSelector'],
  
    initComponent: function() {
	var me = this;

        me.data = [ 
	    ['balance-rr', 'balance-rr'], 
	    ['active-backup', 'active-backup'], 
	    ['balance-xor', 'balance-xor'], 
	    ['broadcast', 'broadcast'], 
	    ['802.3ad', '802.3ad'], 
	    ['balance-tlb', 'balance-tlb'], 
	    ['balance-alb', 'balance-alb']
	];
 
	me.callParent();
    }
});
Ext.define('PVE.form.ViewSelector', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.pveViewSelector'],

    initComponent: function() {
	var me = this;

	var default_views = {
	    server: {
		text: gettext('Server View'),
		groups: ['node']
	    },
	    folder: {
		text: gettext('Folder View'),
		groups: ['type']
	    },
	    storage: {
		text: gettext('Storage View'),
		groups: ['node'],
		filterfn: function(node) {
		    return node.data.type === 'storage';
		}
	    }
	};

	var groupdef = [];
	Ext.Object.each(default_views, function(viewname, value) {
	    groupdef.push([viewname, value.text]);
	});

	var store = Ext.create('Ext.data.Store', {
	    model: 'KeyValue',
            proxy: {
		type: 'memory',
		reader: 'array'
            },
	    data: groupdef,
	    autoload: true,
	    autoDestory: true
	});

	Ext.apply(me, {
	    hideLabel: true,
	    store: store,
	    value: groupdef[0][0],
	    editable: false,
	    queryMode: 'local',
	    allowBlank: false,
	    forceSelection: true,
	    autoSelect: false,
	    triggerAction: 'all',
	    valueField: 'key',
	    displayField: 'value',

	    getViewFilter: function() {
		var view = me.getValue();
		return Ext.apply({ id: view }, default_views[view] || default_views.server);
	    },

	    getState: function() {
		return { value: me.getValue() };
	    },

	    applyState : function(state, doSelect) {
		var view = me.getValue();
		if (state && state.value && (view != state.value)) {
		    var record = store.findRecord('key', state.value);
		    if (record) {
			me.setValue(state.value, true);
			if (doSelect) {
			    me.fireEvent('select', me, [record]);
			}
		    }
		}
	    },
	    stateEvents: [ 'select' ],
	    stateful: true,
	    id: 'view'
	});

	me.callParent();

	var statechange = function(sp, key, value) {
	    if (key === me.id) {
		me.applyState(value, true);
	    }
	};

	var sp = Ext.state.Manager.getProvider();

	me.mon(sp, 'statechange', statechange, me);
    }
});Ext.define('PVE.form.NodeSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.PVE.form.NodeSelector'],

    // invalidate nodes which are offline
    onlineValidator: false,

    selectCurNode: false,

    // only allow those nodes (array)
    allowedNodes: undefined,

    initComponent: function() {
	var me = this;

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'node', 'cpu', 'maxcpu', 'mem', 'maxmem', 'uptime' ],
	    autoLoad: true,
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes'
	    },
	    autoDestory: true,
	    sorters: [
		{
		    property : 'node',
		    direction: 'ASC'
		},
		{
		    property : 'mem',
		    direction: 'DESC'
		}
	    ]
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'node',
	    displayField: 'node',
            listConfig: {
		columns: [
		    {
			header: 'Node',
			dataIndex: 'node',
			sortable: true,
			hideable: false,
			flex: 1
		    },
		    {
			header: 'Memory usage',			
			renderer: PVE.Utils.render_mem_usage,
			sortable: true,
			width: 100,
			dataIndex: 'mem'
		    },
		    {
			header: 'CPU usage',
			renderer: PVE.Utils.render_cpu,
			sortable: true,
			width: 100,
			dataIndex: 'cpu'
		    }
		]
	    },
	    validator: function(value) {
		/*jslint confusion: true */
		if (!me.onlineValidator || (me.allowBlank && !value)) {
		    return true;
		}
		
		var offline = [];
		var notAllowed = [];

		Ext.Array.each(value.split(/\s*,\s*/), function(node) {
		    var rec = me.store.findRecord(me.valueField, node);
		    if (!(rec && rec.data) || !Ext.isNumeric(rec.data.mem)) {
			offline.push(node);
		    } else if (me.allowedNodes && !Ext.Array.contains(me.allowedNodes, node)) {
			notAllowed.push(node);
		    }
		});

		if (notAllowed.length !== 0) {
		    return "Node " + notAllowed.join(', ') + " is not allowed for this action!";
		} 

		if (offline.length !== 0) {
		    return "Node " + offline.join(', ') + " seems to be offline!";
		}
		return true;
	    }
	});

        if (me.selectCurNode && PVE.curSelectedNode.data.node) {
            me.preferredValue = PVE.curSelectedNode.data.node;
        }

        me.callParent();
    }
});
Ext.define('PVE.form.FileSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.pveFileSelector'],

    setStorage: function(storage, nodename) {
	var me = this;

	var change = false;
	if (storage && (me.storage !== storage)) {
	    me.storage = storage;
	    change = true;
	}

	if (nodename && (me.nodename !== nodename)) {
	    me.nodename = nodename;
	    change = true;
	}

	if (!(me.storage && me.nodename && change)) {
	    return;
	}

	var url = '/api2/json/nodes/' + me.nodename + '/storage/' + me.storage + '/content';
	if (me.storageContent) {
	    url += '?content=' + me.storageContent;
	}

	me.store.setProxy({
	    type: 'pve',
	    url: url
	});

	me.store.load();
    },

    initComponent: function() {
	var me = this;

	var store = Ext.create('Ext.data.Store', {
	    model: 'pve-storage-content'
	});

	Ext.apply(me, {
	    store: store,
	    allowBlank: false,
	    autoSelect: false,
	    valueField: 'volid',
	    displayField: 'text',
            listConfig: {
		columns: [
		    {
			header: 'Name',
			dataIndex: 'text',
			hideable: false,
			flex: 1
		    },
		    {
			header: 'Format',  
			width: 60, 
			dataIndex: 'format'
		    },
		    {
			header: 'Size',  
			width: 60, 
			dataIndex: 'size', 
			renderer: PVE.Utils.format_size 
		    }
		]
	    }
	});

        me.callParent();

	me.setStorage(me.storage, me.nodename);
    }
});Ext.define('PVE.form.StorageSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.PVE.form.StorageSelector'],

    reloadStorageList: function() {
	var me = this;
	if (!me.nodename) {
	    return;
	}

	var params = {};
	var url = '/api2/json/nodes/' + me.nodename + '/storage';
	if (me.storageContent) {
	    params.content = me.storageContent;
	}
	if (me.targetNode) {
	    params.target = me.targetNode;
	    params.enabled = 1; // skip disabled storages
	}
	me.store.setProxy({
	    type: 'pve',
	    url: url,
	    extraParams: params
	});

	me.store.load();
 
    },

    setTargetNode: function(targetNode) {
	var me = this;

	if (!targetNode || (me.targetNode === targetNode)) {
	    return;
	}

	me.targetNode = targetNode;

	me.reloadStorageList();
    },

    setNodename: function(nodename) {
	var me = this;

	if (!nodename || (me.nodename === nodename)) {
	    return;
	}

	me.nodename = nodename;

	me.reloadStorageList();
    },

    initComponent: function() {
	var me = this;

	var nodename = me.nodename;
	me.nodename = undefined; 

	var store = Ext.create('Ext.data.Store', {
	    model: 'pve-storage-status',
	    sorters: {
		property: 'storage', 
		order: 'DESC' 
	    }
	});

	Ext.apply(me, {
	    store: store,
	    allowBlank: false,
	    valueField: 'storage',
	    displayField: 'storage',
            listConfig: {
		columns: [
		    {
			header: 'Name',
			dataIndex: 'storage',
			hideable: false,
			flex: 1
		    },
		    {
			header: 'Type',  
			width: 60, 
			dataIndex: 'type'
		    },
		    {
			header: 'Avail',  
			width: 80, 
			dataIndex: 'avail', 
			renderer: PVE.Utils.format_size 
		    },
		    {
			header: 'Capacity',  
			width: 80, 
			dataIndex: 'total', 
			renderer: PVE.Utils.format_size 
		    }
		]
	    }
	});

        me.callParent();

	if (nodename) {
	    me.setNodename(nodename);
	}
    }
}, function() {

    Ext.define('pve-storage-status', {
	extend: 'Ext.data.Model',
	fields: [ 'storage', 'active', 'type', 'avail', 'total' ],
	idProperty: 'storage'
    });

});
Ext.define('PVE.form.BridgeSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.PVE.form.BridgeSelector'],

    setNodename: function(nodename) {
	var me = this;

	if (!nodename || (me.nodename === nodename)) {
	    return;
	}

	me.nodename = nodename;

	me.store.setProxy({
	    type: 'pve',
	    url: '/api2/json/nodes/' + me.nodename + '/network?type=bridge'
	});

	me.store.load();
    },

    initComponent: function() {
	var me = this;

	var nodename = me.nodename;
	me.nodename = undefined; 

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'iface', 'active', 'type' ],
	    filterOnLoad: true,
	    sorters: [
		{
		    property : 'iface',
		    direction: 'ASC'
		}
	    ]
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'iface',
	    displayField: 'iface',
            listConfig: {
		columns: [
		    {
			header: 'Bridge',
			dataIndex: 'iface',
			hideable: false,
			flex: 1
		    },
		    {
			header: gettext('Active'),  
			width: 60, 
			dataIndex: 'active', 
			renderer: PVE.Utils.format_boolean
		    }
		]
	    }
	});

        me.callParent();

	if (nodename) {
	    me.setNodename(nodename);
	}
    }
});

Ext.define('PVE.form.CPUModelSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.CPUModelSelector'],
  
    initComponent: function() {
	var me = this;

        me.data = [ 
	    ['', 'Default (kvm64)'],
	    ['486', '486'],
	    ['athlon', 'athlon'],
	    ['core2duo', 'core2duo'],
	    ['coreduo', 'coreduo'],
	    ['kvm32', 'kvm32'],
	    ['kvm64', 'kvm64'],
	    ['pentium', 'pentium'],
	    ['pentium2', 'pentium2'],
	    ['pentium3', 'pentium3'],
	    ['phenom', 'phenom'],
	    ['qemu32', 'qemu32'],
	    ['qemu64', 'qemu64'],
	    ['Conroe', 'Conroe'],
	    ['Penryn', 'Penryn'],
	    ['Nehalem', 'Nehalem'],
	    ['Westmere', 'Westmere'],
	    ['SandyBridge', 'SandyBridge'],
	    ['Haswell', 'Haswell'],
	    ['Opteron_G1', 'Opteron_G1'],
	    ['Opteron_G2', 'Opteron_G2'],
	    ['Opteron_G3', 'Opteron_G3'],
	    ['Opteron_G4', 'Opteron_G4'],
	    ['Opteron_G5', 'Opteron_G5'],
	    ['host', 'host']
	];

	me.callParent();
    }
});
Ext.define('PVE.form.VNCKeyboardSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.VNCKeyboardSelector'],
  
    initComponent: function() {
	var me = this;
	me.data = PVE.Utils.kvm_keymap_array();
	me.callParent();
    }
});
Ext.define('PVE.form.LanguageSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.pveLanguageSelector'],
  
    initComponent: function() {
	var me = this;
	me.data = PVE.Utils.language_array();
	me.callParent();
    }
});
Ext.define('PVE.form.DisplaySelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.DisplaySelector'],
  
    initComponent: function() {
	var me = this;

	me.data = PVE.Utils.kvm_vga_driver_array();
	me.callParent();
    }
});
Ext.define('PVE.form.CacheTypeSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.CacheTypeSelector'],
  
    initComponent: function() {
	var me = this;

	me.data = [
	    ['', 'Default (No cache)'],
	    ['directsync', 'Direct sync'],
	    ['writethrough', 'Write through'],
	    ['writeback', 'Write back'],
	    ['unsafe', 'Write back (unsafe)'],
	    ['none', 'No cache']
	];

	me.callParent();
    }
});
Ext.define('PVE.form.SnapshotSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.PVE.form.SnapshotSelector'],

    loadStore: function(nodename, vmid) {
	var me = this;

	if (!nodename) {
	    return;
	}

	me.nodename = nodename;

        if (!vmid) {
	    return;
        }

	me.vmid = vmid;

	me.store.setProxy({
	    type: 'pve',
	    url: '/api2/json/nodes/' + me.nodename + '/qemu/' + me.vmid +'/snapshot'
	});

	me.store.load();
    },

    initComponent: function() {
	var me = this;

        if (!me.nodename) {
            throw "no node name specified";
        }

        if (!me.vmid) {
            throw "no VM ID specified";
        }

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'name'],
	    filterOnLoad: true
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'name',
	    displayField: 'name',
            listConfig: {
		columns: [
		    {
			header: 'Snapshot',
			dataIndex: 'name',
			hideable: false,
			flex: 1
		    }
		]
	    }
	});

        me.callParent();

	me.loadStore(me.nodename, me.vmid);
    }
});
Ext.define('PVE.form.ContentTypeSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.pveContentTypeSelector'],
  
    initComponent: function() {
	var me = this;

	me.data = [];

	var cts = ['images', 'iso', 'vztmpl', 'backup', 'rootdir'];
	Ext.Array.each(cts, function(ct) {
	    me.data.push([ct, PVE.Utils.format_content_types(ct)]);
	});

	me.callParent();
    }
});
Ext.define('PVE.form.DayOfWeekSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.pveDayOfWeekSelector'],
  
    initComponent: function() {
	var me = this;

	me.data = [
	    ['sun', Ext.Date.dayNames[0]],
	    ['mon', Ext.Date.dayNames[1]],
	    ['tue', Ext.Date.dayNames[2]],
	    ['wed', Ext.Date.dayNames[3]],
	    ['thu', Ext.Date.dayNames[4]],
	    ['fri', Ext.Date.dayNames[5]],
	    ['sat', Ext.Date.dayNames[6]]
	];

	me.callParent();
    }
});
Ext.define('PVE.form.BackupModeSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.pveBackupModeSelector'],
  
    initComponent: function() {
	var me = this;

	me.data = [
	    ['snapshot', 'Snapshot'],
	    ['suspend', 'Suspend'],
	    ['stop', 'Stop']
	];

	me.callParent();
    }
});
Ext.define('PVE.form.ScsiHwSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.pveScsiHwSelector'],
  
    initComponent: function() {
	var me = this;

        me.data = [ 
	    ['', PVE.Utils.render_scsihw('')],
	    ['lsi', PVE.Utils.render_scsihw('lsi')],
	    ['megasas', PVE.Utils.render_scsihw('megasas')],
	    ['virtio-scsi-pci', PVE.Utils.render_scsihw('virtio-scsi-pci')]
	];

	me.callParent();
    }
});
Ext.define('PVE.dc.Tasks', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveClusterTasks'],

    initComponent : function() {
	var me = this;

	var taskstore = new PVE.data.UpdateStore({
	    storeid: 'pve-cluster-tasks',
	    model: 'pve-tasks',
	    proxy: {
                type: 'pve',
		url: '/api2/json/cluster/tasks'
	    },
	    sorters: [
		{
		    property : 'starttime',
		    direction: 'DESC'
		}
	    ]
	});

	var store = Ext.create('PVE.data.DiffStore', { 
	    rstore: taskstore,
	    appendAtStart: true 
	});

	var run_task_viewer = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.create('PVE.window.TaskViewer', { 
		upid: rec.data.upid
	    });
	    win.show();
	};

	Ext.apply(me, {
	    store: store,
	    stateful: false,

	    viewConfig: {
		trackOver: false,
		stripeRows: false, // does not work with getRowClass()
 
		getRowClass: function(record, index) {
		    var status = record.get('status');

		    if (status && status != 'OK') {
			return "x-form-invalid-field";
		    }
		}
	    },
	    sortableColumns: false,
	    columns: [
		{ 
		    header: gettext("Start Time"), 
		    dataIndex: 'starttime',
		    width: 100,
		    renderer: function(value) { 
			return Ext.Date.format(value, "M d H:i:s"); 
		    }
		},
		{ 
		    header: gettext("End Time"), 
		    dataIndex: 'endtime',
		    width: 100,
		    renderer: function(value, metaData, record) {
			if (record.data.pid) {
			    if (record.data.type == "vncproxy" || 
				record.data.type == "vncshell" ||
				record.data.type == "spiceproxy") {
				metaData.tdCls =  "x-grid-row-console";
			    } else {
				metaData.tdCls =  "x-grid-row-loading";
			    }
			    return "";
			}
			return Ext.Date.format(value, "M d H:i:s"); 
		    }
		},
		{ 
		    header: gettext("Node"), 
		    dataIndex: 'node',
		    width: 100
		},
		{ 
		    header: gettext("User name"), 
		    dataIndex: 'user',
		    width: 150
		},
		{ 
		    header: gettext("Description"), 
		    dataIndex: 'upid', 
		    flex: 1,		  
		    renderer: PVE.Utils.render_upid
		},
		{ 
		    header: gettext("Status"), 
		    dataIndex: 'status', 
		    width: 200,
		    renderer: function(value, metaData, record) { 
			if (record.data.pid) {
			    if (record.data.type != "vncproxy") {
				metaData.tdCls =  "x-grid-row-loading";
			    }
			    return "";
			}
			if (value == 'OK') {
			    return 'OK';
			}
			// metaData.attr = 'style="color:red;"'; 
			return PVE.Utils.errorText + ': ' + value;
		    }
		}
	    ],
	    listeners: {
		itemdblclick: run_task_viewer,
		show: taskstore.startUpdate,
		hide: taskstore.stopUpdate,
		destroy: taskstore.stopUpdate
	    }
	});

	me.callParent();
    }
});Ext.define('PVE.dc.Log', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveClusterLog'],

    initComponent : function() {
	var me = this;

	var logstore = new PVE.data.UpdateStore({
	    storeid: 'pve-cluster-log',
	    model: 'pve-cluster-log',
	    proxy: {
                type: 'pve',
		url: '/api2/json/cluster/log'
	    }
	});

	var store = Ext.create('PVE.data.DiffStore', { 
	    rstore: logstore,
	    appendAtStart: true 
	});

	Ext.apply(me, {
	    store: store,
	    stateful: false,

	    viewConfig: {
		trackOver: false,
		stripeRows: false, // does not work with getRowClass()
 
		getRowClass: function(record, index) {
		    var pri = record.get('pri');

		    if (pri && pri <= 3) {
			return "x-form-invalid-field";
		    }
		}
	    },
	    sortableColumns: false,
	    columns: [
		{ 
		    header: gettext("Time"), 
		    dataIndex: 'time',
		    width: 100,
		    renderer: function(value) { 
			return Ext.Date.format(value, "M d H:i:s"); 
		    }
		},
		{ 
		    header: gettext("Node"), 
		    dataIndex: 'node',
		    width: 100
		},
		{ 
		    header: gettext("Service"), 
		    dataIndex: 'tag',
		    width: 100
		},
		{ 
		    header: "PID", 
		    dataIndex: 'pid',
		    width: 100 
		},
		{ 
		    header: gettext("User name"), 
		    dataIndex: 'user',
		    width: 150
		},
		{ 
		    header: gettext("Severity"), 
		    dataIndex: 'pri',
		    renderer: PVE.Utils.render_serverity,
		    width: 100 
		},
		{ 
		    header: gettext("Message"), 
		    dataIndex: 'msg',
		    flex: 1	  
		}
	    ],
	    listeners: {
		show: logstore.startUpdate,
		hide: logstore.stopUpdate,
		destroy: logstore.stopUpdate
	    }
	});

	me.callParent();
    }
});Ext.define('PVE.panel.StatusPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pveStatusPanel',

    
    //title: "Logs",
    //tabPosition: 'bottom',

    initComponent: function() {
        var me = this;

	var stateid = 'ltab';
	var sp = Ext.state.Manager.getProvider();

	var state = sp.get(stateid);
	if (state && state.value) {
	    me.activeTab = state.value;
	}

	Ext.apply(me, {
	    listeners: {
		tabchange: function() {
		    var atab = me.getActiveTab().itemId;
		    var state = { value: atab };
		    sp.set(stateid, state);
		}
	    },
	    items: [
		{
		    itemId: 'tasks',
		    title: gettext('Tasks'),
		    xtype: 'pveClusterTasks'
		},
		{
		    itemId: 'clog',
		    title: gettext('Cluster log'),
		    xtype: 'pveClusterLog'
		}
	    ]
	});

	me.callParent();

	me.items.get(0).fireEvent('show', me.items.get(0));

	var statechange = function(sp, key, state) {
	    if (key === stateid) {
		var atab = me.getActiveTab().itemId;
		var ntab = state.value;
		if (state && ntab && (atab != ntab)) {
		    me.setActiveTab(ntab);
		}
	    }
	};

	sp.on('statechange', statechange);
	me.on('destroy', function() {
	    sp.un('statechange', statechange);		    
	});

    }
});
Ext.define('PVE.panel.RRDView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pveRRDView',

    initComponent : function() {
	var me = this;

	if (!me.datasource) {
	    throw "no datasource specified";
	}

	if (!me.rrdurl) {
	    throw "no rrdurl specified";
	}

	var stateid = 'pveRRDTypeSelection';
	var sp = Ext.state.Manager.getProvider();
	var stateinit = sp.get(stateid);

	if (!me.timeframe) {
	    if(stateinit && stateinit.timeframe){
		me.timeframe = stateinit.timeframe;
	    }else{
		me.timeframe = 'hour';
	    }
	}

	if (!me.rrdcffn) {
	    if(stateinit && stateinit.rrdcffn){
		me.rrdcffn = stateinit.cf;
	    }else{
		me.rrdcffn = 'AVERAGE';
	    }
	}


	var datasource = me.datasource;

	// fixme: dcindex??
	var dcindex = 0;
	var create_url = function() {
	    var url = me.rrdurl + "?ds=" + datasource + 
		"&timeframe=" + me.timeframe + "&cf=" + me.rrdcffn +
		"&_dc=" + dcindex.toString();
	    dcindex++;
	    return url;
	};


	Ext.apply(me, {
	    layout: 'fit',
	    html: {
		tag: 'img',
		width: 800,
		height: 200,
		src:  create_url()
	    },
	    applyState : function(state) {
		if (state && state.id) {
		    if(state.timeframe !== me.timeframe || state.cf !== me.rrdcffn){
		        me.timeframe = state.timeframe;
		        me.rrdcffn = state.cf;
		        me.reload_task.delay(10);
		    }
		}
	    }
	});
	
	me.callParent();
   
	me.reload_task = new Ext.util.DelayedTask(function() {
	    if (me.rendered) {
		try {
		    var html = {
			tag: 'img',
			width: 800,
			height: 200,
			src:  create_url()
		    };
		    me.update(html);
		} catch (e) {
		    // fixme:
		    console.log(e);
		}
		me.reload_task.delay(30000);
	    } else {
		me.reload_task.delay(1000);
	    }
	});

	me.reload_task.delay(30000);

	me.on('destroy', function() {
	    me.reload_task.cancel();
	});

	var state_change_fn = function(prov, key, value) {
	    if (key == stateid) {
		me.applyState(value);
	    }
	};

	me.mon(sp, 'statechange', state_change_fn);
    }
});
Ext.define('PVE.panel.InputPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.inputpanel'],

    border: false,

    // overwrite this to modify submit data
    onGetValues: function(values) {
	return values;
    },

    getValues: function(dirtyOnly) {
	var me = this;

	if (Ext.isFunction(me.onGetValues)) {
	    dirtyOnly = false;
	}

	var values = {};

	Ext.Array.each(me.query('[isFormField]'), function(field) {
            if (!dirtyOnly || field.isDirty()) {
                PVE.Utils.assemble_field_data(values, field.getSubmitData());
	    }
	});

	return me.onGetValues(values);
    },

    setValues: function(values) {
	var me = this;

	var form = me.up('form');

        Ext.iterate(values, function(fieldId, val) {
	    var field = me.query('[isFormField][name=' + fieldId + ']')[0];
            if (field) {
		field.setValue(val);
                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
	});
    },

    initComponent: function() {
	var me = this;

	var items;
	
	if (me.items) {
	    me.columns = 1;
	    items = [
		{
		    columnWidth: 1,
		    layout: 'anchor',
		    items: me.items
		}
	    ];
	    me.items = undefined;
	} else if (me.column1) {
	    me.columns = 2;
	    items = [
		{
		    columnWidth: 0.5,
		    padding: '0 10 0 0',
		    layout: 'anchor',
		    items: me.column1
		},
		{
		    columnWidth: 0.5,
		    padding: '0 0 0 10',
		    layout: 'anchor',
		    items: me.column2 || [] // allow empty column
		}
	    ];
	} else {
	    throw "unsupported config";
	}

	if (me.useFieldContainer) {
	    Ext.apply(me, {
		layout: 'fit',
		items: Ext.apply(me.useFieldContainer, { 
		    layout: 'column',
		    defaultType: 'container',
		    items: items
		})
	    });
	} else {
	    Ext.apply(me, {
		layout: 'column',
		defaultType: 'container',
		items: items
	    });
	}
	
	me.callParent();
    }
});
// fixme: how can we avoid those lint errors?
/*jslint confusion: true */
Ext.define('PVE.window.Edit', {
    extend: 'Ext.window.Window',
    alias: 'widget.pveWindowEdit',
 
    resizable: false,

    // use this tio atimatically generate a title like
    // Create: <subject>
    subject: undefined,

    // set create to true if you want a Create button (instead 
    // OK and RESET) 
    create: false, 

    // set to true if you want an Add button (instead of Create)
    isAdd: false,

    backgroundDelay: 0,

    isValid: function() {
	var me = this;

	var form = me.formPanel.getForm();
	return form.isValid();
    },

    getValues: function(dirtyOnly) {
	var me = this;

        var values = {};

	var form = me.formPanel.getForm();

        form.getFields().each(function(field) {
            if (!field.up('inputpanel') && (!dirtyOnly || field.isDirty())) {
                PVE.Utils.assemble_field_data(values, field.getSubmitData());
            }
        });

	Ext.Array.each(me.query('inputpanel'), function(panel) {
	    PVE.Utils.assemble_field_data(values, panel.getValues(dirtyOnly));
	});

        return values;
    },

    setValues: function(values) {
	var me = this;

	var form = me.formPanel.getForm();

	Ext.iterate(values, function(fieldId, val) {
	    var field = form.findField(fieldId);
	    if (field && !field.up('inputpanel')) {
               field.setValue(val);
                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
	});
 
	Ext.Array.each(me.query('inputpanel'), function(panel) {
	    panel.setValues(values);
	});
    },

    submit: function() {
	var me = this;

	var form = me.formPanel.getForm();

	var values = me.getValues();
	Ext.Object.each(values, function(name, val) {
	    if (values.hasOwnProperty(name)) {
                if (Ext.isArray(val) && !val.length) {
		    values[name] = '';
		}
	    }
	});

	if (me.digest) {
	    values.digest = me.digest;
	}

	if (me.backgroundDelay) {
	    values.background_delay = me.backgroundDelay;
	}

	PVE.Utils.API2Request({
	    url: me.url,
	    waitMsgTarget: me,
	    method: me.method || (me.backgroundDelay ? 'POST' : 'PUT'),
	    params: values,
	    failure: function(response, options) {
		if (response.result && response.result.errors) {
		    form.markInvalid(response.result.errors);
		}
		Ext.Msg.alert(gettext('Error'), response.htmlStatus);
	    },
	    success: function(response, options) {
		me.close();
		if (me.backgroundDelay && response.result.data) {
		    var upid = response.result.data;
		    var win = Ext.create('PVE.window.TaskProgress', { 
			upid: upid
		    });
		    win.show();
		}
	    }
	});
    },

    load: function(options) {
	var me = this;

	var form = me.formPanel.getForm();

	options = options || {};

	var newopts = Ext.apply({
	    waitMsgTarget: me
	}, options);

	var createWrapper = function(successFn) {
	    Ext.apply(newopts, {
		url: me.url,
		method: 'GET',
		success: function(response, opts) {
		    form.clearInvalid();
		    me.digest = response.result.data.digest;
		    if (successFn) {
			successFn(response, opts);
		    } else {
			me.setValues(response.result.data);
		    }
		    // hack: fix ExtJS bug
		    Ext.Array.each(me.query('radiofield'), function(f) {
			f.resetOriginalValue();
		    });
		},
		failure: function(response, opts) {
		    Ext.Msg.alert(gettext('Error'), response.htmlStatus, function() {
			me.close();
		    });
		}
	    });
	};

	createWrapper(options.success);

	PVE.Utils.API2Request(newopts);
    },

    initComponent : function() {
	var me = this;

	if (!me.url) {
	    throw "no url specified";
	}

	var items = Ext.isArray(me.items) ? me.items : [ me.items ];

	me.items = undefined;

	me.formPanel = Ext.create('Ext.form.Panel', {
	    url: me.url,
	    method: me.method || 'PUT',
	    trackResetOnLoad: true,
	    bodyPadding: 10,
	    border: false,
	    defaults: {
		border: false
	    },
	    fieldDefaults: Ext.apply({}, me.fieldDefaults, {
		labelWidth: 100,
		anchor: '100%'
            }),
	    items: items
	});

	var form = me.formPanel.getForm();

	var submitBtn = Ext.create('Ext.Button', {
	    text: me.create ? (me.isAdd ? gettext('Add') : gettext('Create')) : gettext('OK'),
	    disabled: !me.create,
	    handler: function() {
		me.submit();
	    }
	});

	var resetBtn = Ext.create('Ext.Button', {
	    text: 'Reset',
	    disabled: true,
	    handler: function(){
		form.reset();
	    }
	});

	var set_button_status = function() {
	    var valid = form.isValid();
	    var dirty = form.isDirty();
	    submitBtn.setDisabled(!valid || !(dirty || me.create));
	    resetBtn.setDisabled(!dirty);
	};

	form.on('dirtychange', set_button_status);
	form.on('validitychange', set_button_status);

	var colwidth = 300;
	if (me.fieldDefaults && me.fieldDefaults.labelWidth) {
	    colwidth += me.fieldDefaults.labelWidth - 100;
	}
	

	var twoColumn = items[0].column1 || items[0].column2;

	if (me.subject && !me.title) {
	    me.title = PVE.Utils.dialog_title(me.subject, me.create, me.isAdd);
	}

	Ext.applyIf(me, {
	    modal: true,
	    layout: 'auto',
	    width: twoColumn ? colwidth*2 : colwidth,
	    border: false,
	    items: [ me.formPanel ],
	    buttons: me.create ? [ submitBtn ] : [ submitBtn, resetBtn ]
	});

	me.callParent();

	// always mark invalid fields
	me.on('afterlayout', function() {
	    me.isValid();
	});
    }
});
Ext.define('PVE.window.LoginWindow', {
    extend: 'Ext.window.Window',

    // private
    onLogon: function() {
	var me = this;

	var form = me.getComponent(0).getForm();

	if(form.isValid()){
            me.el.mask(gettext('Please wait...'), 'x-mask-loading');

	    form.submit({
		failure: function(f, resp){
		    me.el.unmask();
		    Ext.MessageBox.alert(gettext('Error'), 
					 gettext("Login failed. Please try again"), 
					 function() {
			var uf = form.findField('username');
			uf.focus(true, true);
		    });
		},
		success: function(f, resp){
		    me.el.unmask();
		    
		    var handler = me.handler || Ext.emptyFn;
		    handler.call(me, resp.result.data);
		    me.close();
		}
	    });
	}
    },

    initComponent: function() {
	var me = this;

	Ext.apply(me, {
	    width: 400,
	    modal: true,
	    border: false,
	    draggable: true,
	    closable: false,
	    resizable: false,
	    layout: 'auto',
	    title: gettext('Proxmox VE Login'),

	    items: [{
		xtype: 'form',
		frame: true,
		url: '/api2/extjs/access/ticket',

		fieldDefaults: {
		    labelAlign: 'right'
		},

		defaults: {
		    anchor: '-5',
		    allowBlank: false
		},
		
		items: [
		    { 
			xtype: 'textfield', 
			fieldLabel: gettext('User name'), 
			name: 'username',
			blankText: gettext("Enter your user name"),
			listeners: {
			    afterrender: function(f) {
				// Note: only works if we pass delay 1000
				f.focus(true, 1000);
			    },
			    specialkey: function(f, e) {
				if (e.getKey() === e.ENTER) {
				    var pf = me.query('textfield[name="password"]')[0];
				    if (pf.getValue()) {
					me.onLogon();
				    } else {
					pf.focus(false);
				    }
				}
			    }
			}
		    },
		    { 
			xtype: 'textfield', 
			inputType: 'password',
			fieldLabel: gettext('Password'), 
			name: 'password',
			blankText: gettext("Enter your password"),
			listeners: {
			    specialkey: function(field, e) {
				if (e.getKey() === e.ENTER) {
				    me.onLogon();
				}
			    }
			}
		    },
		    {
			xtype: 'pveRealmComboBox',
			name: 'realm'
		    },
		    {   
			xtype: 'pveLanguageSelector',
			fieldLabel: gettext('Language'), 
			value: Ext.util.Cookies.get('PVELangCookie') || 'en',
			name: 'lang',
			submitValue: false,
			listeners: {
			    change: function(t, value) {
				var dt = Ext.Date.add(new Date(), Ext.Date.YEAR, 10);
				Ext.util.Cookies.set('PVELangCookie', value, dt);
				me.el.mask(gettext('Please wait...'), 'x-mask-loading');
				window.location.reload();
			    }
			}
		    }
		],
		buttons: [
		    {
			text: gettext('Login'),
			handler: function(){
			    me.onLogon();
			}
		    }
		]
	    }]
	});

	me.callParent();
    }
});
Ext.define('PVE.window.TaskProgress', {
    extend: 'Ext.window.Window',
    alias: 'widget.pveTaskProgress',

    initComponent: function() {
        var me = this;

	if (!me.upid) {
	    throw "no task specified";
	}

	var task = PVE.Utils.parse_task_upid(me.upid);

	var statstore = Ext.create('PVE.data.ObjectStore', {
            url: "/api2/json/nodes/" + task.node + "/tasks/" + me.upid + "/status",
	    interval: 1000,
	    rows: {
		status: { defaultValue: 'unknown' },
		exitstatus: { defaultValue: 'unknown' }
	    }
	});

	me.on('destroy', statstore.stopUpdate);	

	var getObjectValue = function(key, defaultValue) {
	    var rec = statstore.getById(key);
	    if (rec) {
		return rec.data.value;
	    }
	    return defaultValue;
	};

	var pbar = Ext.create('Ext.ProgressBar', { text: 'running...' });

	me.mon(statstore, 'load', function() {
	    var status = getObjectValue('status');
	    if (status === 'stopped') {
		var exitstatus = getObjectValue('exitstatus');
		if (exitstatus == 'OK') {
		    pbar.reset();
		    pbar.updateText("Done!");
		    Ext.Function.defer(me.close, 1000, me);
		} else {
		    me.close();
		    Ext.Msg.alert('Task failed', exitstatus);
		}
	    }
	});

	var descr = PVE.Utils.format_task_description(task.type, task.id);

	Ext.applyIf(me, {
	    title: "Task: " + descr,
	    width: 300,
	    layout: 'auto',
	    modal: true,
	    bodyPadding: 5,
	    items: pbar,
	    buttons: [
		{ 
		    text: gettext('Details'),
		    handler: function() {			
			var win = Ext.create('PVE.window.TaskViewer', { 
			    upid: me.upid
			});
			win.show();
			me.close();
		    }
		}
	    ]
	});

	me.callParent();

	statstore.startUpdate();

	pbar.wait();
    }
});

// fixme: how can we avoid those lint errors?
/*jslint confusion: true */

Ext.define('PVE.window.TaskViewer', {
    extend: 'Ext.window.Window',
    alias: 'widget.pveTaskViewer',

    initComponent: function() {
        var me = this;

	if (!me.upid) {
	    throw "no task specified";
	}

	var task = PVE.Utils.parse_task_upid(me.upid);

	var statgrid;

	var rows = {
	    status: {
		header: gettext('Status'),
		defaultValue: 'unknown',
		renderer: function(value) {
		    if (value != 'stopped') {
			return value;
		    }
		    var es = statgrid.getObjectValue('exitstatus');
		    if (es) {
			return value + ': ' + es;
		    }
		}
	    },
	    exitstatus: { 
		visible: false
	    },
	    type: {
		header: 'Task type',
		required: true
	    },
	    user: {
		header: gettext('User name'),
		required: true 
	    },
	    node: {
		header: gettext('Node'),
		required: true 
	    },
	    pid: {
		header: 'Process ID',
		required: true
	    },
	    starttime: {
		header: gettext('Start Time'),
		required: true, 
		renderer: PVE.Utils.render_timestamp
	    },
	    upid: {
		header: 'Unique task ID'
	    }
	};

	var statstore = Ext.create('PVE.data.ObjectStore', {
            url: "/api2/json/nodes/" + task.node + "/tasks/" + me.upid + "/status",
	    interval: 1000,
	    rows: rows
	});

	me.on('destroy', statstore.stopUpdate);	

	var stop_task = function() {
	    PVE.Utils.API2Request({
		url: "/nodes/" + task.node + "/tasks/" + me.upid,
		waitMsgTarget: me,
		method: 'DELETE',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	var stop_btn1 = new Ext.Button({
	    text: gettext('Stop'),
	    disabled: true,
	    handler: stop_task
	});

	var stop_btn2 = new Ext.Button({
	    text: gettext('Stop'),
	    disabled: true,
	    handler: stop_task
	});

	statgrid = Ext.create('PVE.grid.ObjectGrid', {
	    title: gettext('Status'),
	    layout: 'fit',
	    tbar: [ stop_btn1 ],
	    rstore: statstore,
	    rows: rows,
	    border: false
	});

	var logView = Ext.create('PVE.panel.LogView', {
	    title: gettext('Output'),
	    tbar: [ stop_btn2 ],
	    border: false,
	    url: "/api2/extjs/nodes/" + task.node + "/tasks/" + me.upid + "/log"
	});

	me.mon(statstore, 'load', function() {
	    var status = statgrid.getObjectValue('status');
	    
	    if (status === 'stopped') {
		logView.requestUpdate(undefined, true);
		logView.scrollToEnd = false;
		statstore.stopUpdate();
	    }

	    stop_btn1.setDisabled(status !== 'running');
	    stop_btn2.setDisabled(status !== 'running');
	});

	statstore.startUpdate();

	Ext.applyIf(me, {
	    title: "Task viewer: " + task.desc,
	    width: 800,
	    height: 400,
	    layout: 'fit',
	    modal: true,
	    bodyPadding: 5,
	    items: [{
		xtype: 'tabpanel',
		region: 'center',
		items: [ logView, statgrid ]
	    }]
        });

	me.callParent();

	logView.fireEvent('show', logView);
    }
});

Ext.define('PVE.window.Wizard', {
    extend: 'Ext.window.Window',
    
    getValues: function(dirtyOnly) {
	var me = this;

        var values = {};

	var form = me.down('form').getForm();

        form.getFields().each(function(field) {
            if (!field.up('inputpanel') && (!dirtyOnly || field.isDirty())) {
                PVE.Utils.assemble_field_data(values, field.getSubmitData());
            }
        });

	Ext.Array.each(me.query('inputpanel'), function(panel) {
	    PVE.Utils.assemble_field_data(values, panel.getValues(dirtyOnly));
	});

        return values;
    },

    initComponent: function() {
	var me = this;

	var tabs = me.items || [];
	delete me.items;
	
	/* 
	 * Items may have the following functions:
	 * validator(): per tab custom validation
	 * onSubmit(): submit handler
	 * onGetValues(): overwrite getValues results
	 */

	Ext.Array.each(tabs, function(tab) {
	    tab.disabled = true;
	});
	tabs[0].disabled = false;

	var check_card = function(card) {
	    var valid = true;
	    var fields = card.query('field, fieldcontainer');
	    if (card.isXType('fieldcontainer')) {
		fields.unshift(card);
	    }
	    Ext.Array.each(fields, function(field) {
		// Note: not all fielcontainer have isValid()
		if (Ext.isFunction(field.isValid) && !field.isValid()) {
		    valid = false;
		}
	    });

	    if (Ext.isFunction(card.validator)) {
		return card.validator();
	    }

	    return valid;
	};


	var tbar = Ext.create('Ext.toolbar.Toolbar', {
            ui: 'footer',
	    region: 'south',
	    margins: '0 5 5 5',
	    items: [  
		'->', 
		{ 
		    text: gettext('Back'),
		    disabled: true,
		    itemId: 'back',
		    minWidth: 60,
		    handler: function() {
			var tp = me.down('#wizcontent');
			var atab = tp.getActiveTab();
			var prev = tp.items.indexOf(atab) - 1;
			if (prev < 0) {
			    return;
			}
			var ntab = tp.items.getAt(prev);
			if (ntab) {
			    tp.setActiveTab(ntab);
			}


		    }
		},
		{
		    text: gettext('Next'),
		    disabled: true,
		    itemId: 'next',
		    minWidth: 60,
		    handler: function() {

			var form = me.down('form').getForm();

			var tp = me.down('#wizcontent');
			var atab = tp.getActiveTab();
			if (!check_card(atab)) {
			    return;
			}
				       
			var next = tp.items.indexOf(atab) + 1;
			var ntab = tp.items.getAt(next);
			if (ntab) {
			    ntab.enable();
			    tp.setActiveTab(ntab);
			}
			
		    }
		},
		{
		    text: gettext('Finish'),
		    minWidth: 60,
		    hidden: true,
		    itemId: 'submit',
		    handler: function() {
			var tp = me.down('#wizcontent');
			var atab = tp.getActiveTab();
			atab.onSubmit();
		    }
		}
	    ]
	});

	var display_header = function(newcard) {
	    var html = '<h1>' + newcard.title + '</h1>';
	    if (newcard.descr) {
		html += newcard.descr;
	    }
	    me.down('#header').update(html);
	};

	var disable_at = function(card) {
	    var tp = me.down('#wizcontent');
	    var idx = tp.items.indexOf(card);
	    for(;idx < tp.items.getCount();idx++) {
		var nc = tp.items.getAt(idx);
		if (nc) {
		    nc.disable();
		}
	    }
	};

	var tabchange = function(tp, newcard, oldcard) {
	    if (newcard.onSubmit) {
		me.down('#next').setVisible(false);
		me.down('#submit').setVisible(true); 
	    } else {
		me.down('#next').setVisible(true);
		me.down('#submit').setVisible(false); 
	    }
	    var valid = check_card(newcard);
	    me.down('#next').setDisabled(!valid);    
	    me.down('#submit').setDisabled(!valid);    
	    me.down('#back').setDisabled(tp.items.indexOf(newcard) == 0);

	    if (oldcard && !check_card(oldcard)) {
		disable_at(oldcard);
	    }

	    var next = tp.items.indexOf(newcard) + 1;
	    var ntab = tp.items.getAt(next);
	    if (valid && ntab && !newcard.onSubmit) {
		ntab.enable();
	    }
	};

	if (me.subject && !me.title) {
	    me.title = PVE.Utils.dialog_title(me.subject, true, false);
	}

	Ext.applyIf(me, {
	    width: 620,
	    height: 400,
	    modal: true,
	    border: false,
	    draggable: true,
	    closable: true,
	    resizable: false,
	    layout: 'border',
	    items: [
		{
		    // disabled for now - not really needed
		    hidden: true, 
		    region: 'north',
		    itemId: 'header',
		    layout: 'fit',
		    margins: '5 5 0 5',
		    bodyPadding: 10,
		    html: ''
		},
		{
		    xtype: 'form',
		    region: 'center',
		    layout: 'fit',
		    border: false,
		    margins: '5 5 0 5',
		    fieldDefaults: {
			labelWidth: 100,
			anchor: '100%'
		    },
		    items: [{
			itemId: 'wizcontent',
			xtype: 'tabpanel',
			activeItem: 0,
			bodyPadding: 10,
			listeners: {
			    afterrender: function(tp) {
				var atab = this.getActiveTab();
				tabchange(tp, atab);
			    },
			    tabchange: function(tp, newcard, oldcard) {
				display_header(newcard);
				tabchange(tp, newcard, oldcard);
			    }
			},
			items: tabs
		    }]
		},
		tbar
	    ]
	});
	me.callParent();
	display_header(tabs[0]);

	Ext.Array.each(me.query('field'), function(field) {
	    field.on('validitychange', function(f) {
		var tp = me.down('#wizcontent');
		var atab = tp.getActiveTab();
		var valid = check_card(atab);
		me.down('#next').setDisabled(!valid);
		me.down('#submit').setDisabled(!valid);    
		var next = tp.items.indexOf(atab) + 1;
		var ntab = tp.items.getAt(next);
		if (!valid) {
		    disable_at(ntab);
		} else if (ntab && !atab.onSubmit) {
		    ntab.enable();
		}
	    });
	});
    }
});
Ext.define('PVE.window.NotesEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	Ext.apply(me, {
	    title: gettext('Notes'),
	    width: 600,
	    layout: 'fit',
	    items: {
		xtype: 'textarea',
		name: 'description',
		rows: 7,
		value: '',
		hideLabel: true
	    }
	});

	me.callParent();

	me.load();
    }
});
Ext.define('PVE.window.Backup', {
    extend: 'Ext.window.Window',

    resizable: false,

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	if (!me.vmtype) {
	    throw "no VM type specified";
	}

	var storagesel = Ext.create('PVE.form.StorageSelector', {
	    nodename: me.nodename,
	    name: 'storage',
	    value: me.storage,
	    fieldLabel: gettext('Storage'),
	    storageContent: 'backup',
	    allowBlank: false
	});

	me.formPanel = Ext.create('Ext.form.Panel', {
	    bodyPadding: 10,
	    border: false,
	    fieldDefaults: {
		labelWidth: 100,
		anchor: '100%'
	    },
	    items: [
		storagesel,
		{
		    xtype: 'pveBackupModeSelector',
		    fieldLabel: gettext('Mode'),
		    value: 'snapshot',
		    name: 'mode'
		},
		{
		    xtype: 'pveCompressionSelector',
		    name: 'compress',
		    value: 'lzo',
		    fieldLabel: gettext('Compression')
		}
	    ]
	});

	var form = me.formPanel.getForm();

	var submitBtn = Ext.create('Ext.Button', {
	    text: gettext('Backup'),
	    handler: function(){
		var storage = storagesel.getValue();
		var values = form.getValues();
		var params = {
		    storage: storage,
		    vmid: me.vmid,
		    mode: values.mode,
		    remove: 0
		};
		if (values.compress) {
		    params.compress = values.compress;
		}

		PVE.Utils.API2Request({
		    url: '/nodes/' + me.nodename + '/vzdump',
		    params: params,
		    method: 'POST',
		    failure: function (response, opts) {
			Ext.Msg.alert('Error',response.htmlStatus);
		    },
		    success: function(response, options) {
			var upid = response.result.data;
			
			var win = Ext.create('PVE.window.TaskViewer', { 
			    upid: upid
			});
			win.show();
			me.close();
		    }
		});
	    }
	});

	var title = gettext('Backup') + " " + 
	    ((me.vmtype === 'openvz') ? "CT" : "VM") +
	    " " + me.vmid;

	Ext.apply(me, {
	    title: title,
	    width: 350,
	    modal: true,
	    layout: 'auto',
	    border: false,
	    items: [ me.formPanel ],
	    buttons: [ submitBtn ]
	});

	me.callParent();
    }
});
Ext.define('PVE.window.Restore', {
    extend: 'Ext.window.Window', // fixme: PVE.window.Edit?

    resizable: false,

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.volid) {
	    throw "no volume ID specified";
	}

	if (!me.vmtype) {
	    throw "no vmtype specified";
	}

	var storagesel = Ext.create('PVE.form.StorageSelector', {
	    nodename: me.nodename,
	    name: 'storage',
	    value: '',
	    fieldLabel: gettext('Storage'),
	    storageContent: (me.vmtype === 'openvz') ? 'rootdir' : 'images',
	    allowBlank: true
	});

	me.formPanel = Ext.create('Ext.form.Panel', {
	    bodyPadding: 10,
	    border: false,
	    fieldDefaults: {
		labelWidth: 60,
		anchor: '100%'
	    },
	    items: [
		{
		    xtype: 'displayfield',
		    value: me.volidText || me.volid,
		    fieldLabel: gettext('Source')
		},
		storagesel,
		{
		    xtype: me.vmid ? 'displayfield' : 'pveVMIDSelector',
		    name: 'vmid',
		    fieldLabel: 'VM ID',
		    value: me.vmid,
		    loadNextFreeVMID: me.vmid ? false: true,
		    validateExists: false
		}
	    ]
	});

	var form = me.formPanel.getForm();

	var doRestore = function(url, params) {
	    PVE.Utils.API2Request({
		url: url,
		params: params,
		method: 'POST',
		waitMsgTarget: me,
		failure: function (response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		},
		success: function(response, options) {
		    var upid = response.result.data;
		    
		    var win = Ext.create('PVE.window.TaskViewer', { 
			upid: upid
		    });
		    win.show();
		    me.close();
		}
	    });
	};

	var submitBtn = Ext.create('Ext.Button', {
	    text: gettext('Restore'),
	    handler: function(){
		var storage = storagesel.getValue();
		var values = form.getValues();

		var params = {
		    storage: storage,
		    vmid: me.vmid || values.vmid,
		    force: me.vmid ? 1 : 0
		};

		var url;
		if (me.vmtype === 'openvz') {
		    url = '/nodes/' + me.nodename + '/openvz';
		    params.ostemplate = me.volid;
		    params.restore = 1;
		} else if (me.vmtype === 'qemu') {
		    url = '/nodes/' + me.nodename + '/qemu';
		    params.archive = me.volid;
		} else {
		    throw 'unknown VM type';
		}

		if (me.vmid) {
		    var msg = gettext('Are you sure you want to restore this VM?') + ' ' +
			gettext('This will permanently erase current VM data.');
		    Ext.Msg.confirm('Confirmation', msg, function(btn) {
			if (btn !== 'yes') {
			    return;
			}
			doRestore(url, params);
		    });
		} else {
		    doRestore(url, params);
		}
	    }
	});

	form.on('validitychange', function(f, valid) {
	    submitBtn.setDisabled(!valid);
	});

	var title = (me.vmtype === 'openvz') ? "Restore CT" : "Restore VM";

	Ext.apply(me, {
	    title: title,
	    width: 450,
	    modal: true,
	    layout: 'auto',
	    border: false,
	    items: [ me.formPanel ],
	    buttons: [ submitBtn ]
	});

	me.callParent();
    }
});
Ext.define('PVE.panel.NotesView', {
    extend: 'Ext.panel.Panel',

    load: function() {
	var me = this;
	
	PVE.Utils.API2Request({
	    url: me.url,
	    waitMsgTarget: me,
	    failure: function(response, opts) {
		me.update("Error " + response.htmlStatus);
	    },
	    success: function(response, opts) {
		var data = response.result.data.description || '';
		me.update(Ext.htmlEncode(data));
	    }
	});
    },

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var vmtype = me.pveSelNode.data.type;
	var url;

	if (vmtype === 'qemu') {
	    me.url = '/api2/extjs/nodes/' + nodename + '/qemu/' + vmid + '/config';
	} else if (vmtype === 'openvz') {
	    me.url = '/api2/extjs/nodes/' + nodename + '/openvz/' + vmid + '/config';
	} else {
	    throw "unknown vm type '" + vmtype + "'";
	}

	Ext.apply(me, {
	    title: gettext("Notes"),
	    style: 'padding-left:10px',
	    bodyStyle: 'white-space:pre',
	    bodyPadding: 10,
	    autoScroll: true,
	    listeners: {
		render: function(c) {
		    c.el.on('dblclick', function() { 
			var win = Ext.create('PVE.window.NotesEdit', {
			    pveSelNode: me.pveSelNode,
			    url: me.url
			});
			win.show();
			win.on('destroy', me.load, me);
		    });
		}
	    }
	});

	me.callParent();
    }
});
Ext.override(Ext.view.Table, {
    afterRender: function() {
        var me = this;
        
        me.callParent();
        me.mon(me.el, {
            scroll: me.fireBodyScroll,
            scope: me
        });
	if (!me.featuresMC ||
	    (me.featuresMC.findIndex('ftype', 'selectable') < 0)) {
            me.el.unselectable();
	}

        me.attachEventsForFeatures();
    }
});

Ext.define('PVE.grid.SelectFeature', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.selectable',

    mutateMetaRowTpl: function(metaRowTpl) {
	var tpl, i,
	ln = metaRowTpl.length;
	
	for (i = 0; i < ln; i++) {
	    tpl = metaRowTpl[i];
	    tpl = tpl.replace(/x-grid-row/, 'x-grid-row x-selectable');
	    tpl = tpl.replace(/x-grid-cell-inner x-unselectable/g, 'x-grid-cell-inner');
	    tpl = tpl.replace(/unselectable="on"/g, '');
	    metaRowTpl[i] = tpl;
	}
    }	
});
Ext.define('PVE.grid.ObjectGrid', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveObjectGrid'],

    getObjectValue: function(key, defaultValue) {
	var me = this;
	var rec = me.store.getById(key);
	if (rec) {
	    return rec.data.value;
	}
	return defaultValue;
    },

    renderKey: function(key, metaData, record, rowIndex, colIndex, store) {
	var me = this;
	var rows = me.rows;
	var rowdef = (rows && rows[key]) ?  rows[key] : {};
	return rowdef.header || key;
    },

    renderValue: function(value, metaData, record, rowIndex, colIndex, store) {
	var me = this;
	var rows = me.rows;
	var key = record.data.key;
	var rowdef = (rows && rows[key]) ?  rows[key] : {};

	var renderer = rowdef.renderer;
	if (renderer) {
	    return renderer(value, metaData, record, rowIndex, colIndex, store);
	}

	return value;
    },

    initComponent : function() {
	var me = this;

	var rows = me.rows;

	if (!me.rstore) {
	    if (!me.url) {
		throw "no url specified";
	    }

	    me.rstore = Ext.create('PVE.data.ObjectStore', {
		url: me.url,
		interval: me.interval,
		extraParams: me.extraParams,
		rows: me.rows
	    });
	}

	var rstore = me.rstore;

	var store = Ext.create('PVE.data.DiffStore', { rstore: rstore });

	if (rows) {
	    Ext.Object.each(rows, function(key, rowdef) {
		if (Ext.isDefined(rowdef.defaultValue)) {
		    store.add({ key: key, value: rowdef.defaultValue });
		} else if (rowdef.required) {
		    store.add({ key: key, value: undefined });
		}
	    });
	}

	if (me.sorterFn) {
	    store.sorters.add(new Ext.util.Sorter({
		sorterFn: me.sorterFn
	    }));
	}

	store.filters.add(new Ext.util.Filter({
	    filterFn: function(item) {
		if (rows) {
		    var rowdef = rows[item.data.key];
		    if (!rowdef || (rowdef.visible === false)) {
			return false;
		    }
		}
		return true;
	    }
	}));

	PVE.Utils.monStoreErrors(me, rstore);

	Ext.applyIf(me, {
	    store: store,
	    hideHeaders: true,
	    stateful: false,
	    columns: [
		{
		    header: 'Name',
		    width: me.cwidth1 || 100,
		    dataIndex: 'key',
		    renderer: me.renderKey
		},
		{
		    flex: 1,
		    header: 'Value',
		    dataIndex: 'value',
		    renderer: me.renderValue
		}
	    ]
	});

	me.callParent();
   }
});
// fixme: remove this fix
// this hack is required for ExtJS 4.0.0
Ext.override(Ext.grid.feature.Chunking, {
    attachEvents: function() {
        var grid = this.view.up('gridpanel'),
            scroller = grid.down('gridscroller[dock=right]');
        if (scroller === null ) {
            grid.on("afterlayout", this.attachEvents, this);
	    return;
        }
        scroller.el.on('scroll', this.onBodyScroll, this, {buffer: 300});
    },
    rowHeight: PVE.Utils.gridLineHeigh()
});

Ext.define('PVE.grid.ResourceGrid', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveResourceGrid'],

    //fixme: this makes still problems with the scrollbar
    //features: [ {ftype: 'chunking'}],
    
    initComponent : function() {
	var me = this;

	var rstore = PVE.data.ResourceStore;
	var sp = Ext.state.Manager.getProvider();

	var coldef = rstore.defaultColums();

	var store = Ext.create('Ext.data.Store', {
	    model: 'PVEResources',
	    sorters: [
		{
		    property : 'type',
		    direction: 'ASC'
		}
	    ],
	    proxy: { type: 'memory' }
	});

	var textfilter = '';

	var textfilter_match = function(item) {
	    var match = false;
	    Ext.each(['name', 'storage', 'node', 'type', 'text'], function(field) {
		var v = item.data[field];
		if (v !== undefined) {
		    v = v.toLowerCase();
		    if (v.indexOf(textfilter) >= 0) {
			match = true;
			return false;
		    }
		}
	    });
	    return match;
	};

	var updateGrid = function() {

	    var filterfn = me.viewFilter ? me.viewFilter.filterfn : null;
	    
	    //console.log("START GRID UPDATE " +  me.viewFilter);

	    store.suspendEvents();

	    var nodeidx = {};
	    var gather_child_nodes = function(cn) {
		if (!cn) {
		    return;
		}
                var cs = cn.childNodes;
		if (!cs) {
		    return;
		}
		var len = cs.length, i = 0, n, res;

                for (; i < len; i++) {
		    var child = cs[i];
		    var orgnode = rstore.data.get(child.data.id);
		    if (orgnode) {
			if ((!filterfn || filterfn(child)) &&
			    (!textfilter || textfilter_match(child))) {
			    nodeidx[child.data.id] = orgnode;
			}
		    }
		    gather_child_nodes(child);
		}
	    };
	    gather_child_nodes(me.pveSelNode);

	    // remove vanished items
	    var rmlist = [];
	    store.each(function(olditem) {
		var item = nodeidx[olditem.data.id];
		if (!item) {
		    //console.log("GRID REM UID: " + olditem.data.id);
		    rmlist.push(olditem);
		}
	    });

	    if (rmlist.length) {
		store.remove(rmlist);
	    }

	    // add new items
	    var addlist = [];
	    var key;
	    for (key in nodeidx) {
		if (nodeidx.hasOwnProperty(key)) {
		    var item = nodeidx[key];
		
		    // getById() use find(), which is slow (ExtJS4 DP5) 
		    //var olditem = store.getById(item.data.id);
		    var olditem = store.data.get(item.data.id);

		    if (!olditem) {
			//console.log("GRID ADD UID: " + item.data.id);
			var info = Ext.apply({}, item.data);
			var child = Ext.ModelMgr.create(info, store.model, info.id);
			addlist.push(item);
			continue;
		    }
		    // try to detect changes
		    var changes = false;
		    var fieldkeys = PVE.data.ResourceStore.fieldNames;
		    var fieldcount = fieldkeys.length;
		    var fieldind;
		    for (fieldind = 0; fieldind < fieldcount; fieldind++) {
			var field = fieldkeys[fieldind];
			if (field != 'id' && item.data[field] != olditem.data[field]) {
			    changes = true;
			    //console.log("changed item " + item.id + " " + field + " " + item.data[field] + " != " + olditem.data[field]);
			    olditem.beginEdit();
			    olditem.set(field, item.data[field]);
			}
		    }
		    if (changes) {
			olditem.endEdit(true);
			olditem.commit(true); 
		    }
		}
	    }

	    if (addlist.length) {
		store.add(addlist);
	    }

	    store.sort();

	    store.resumeEvents();

	    store.fireEvent('datachanged', store);

	    //console.log("END GRID UPDATE");
	};

	var filter_task = new Ext.util.DelayedTask(function(){
	    updateGrid();
	});

	var load_cb = function() { 
	    updateGrid(); 
	};

	Ext.applyIf(me, {
	    title: gettext('Search')
	});

	Ext.apply(me, {
	    store: store,
	    tbar: [
		'->', 
		gettext('Search') + ':', ' ',
		{
		    xtype: 'textfield',
		    width: 200,
		    value: textfilter,
		    enableKeyEvents: true,
		    listeners: {
			keyup: function(field, e) {
			    var v = field.getValue();
			    textfilter = v.toLowerCase();
			    filter_task.delay(500);
			}
		    }
		}
	    ],
	    viewConfig: {
		stripeRows: true
            },
	    listeners: {
		itemcontextmenu: function(v, record, item, index, event) {
		    event.stopEvent();
		    v.select(record);
		    var menu;
		    
		    if (record.data.type === 'qemu') {
			menu = Ext.create('PVE.qemu.CmdMenu', {
			    pveSelNode: record
			});
		    } else if (record.data.type === 'openvz') {
			menu = Ext.create('PVE.openvz.CmdMenu', {
			    pveSelNode: record
			});
		    } else {
			return;
		    }

		    menu.showAt(event.getXY());
		},
		itemdblclick: function(v, record) {
		    var ws = me.up('pveStdWorkspace');
		    ws.selectById(record.data.id);
		},
		destroy: function() {
		    rstore.un("load", load_cb);
		}
	    },
            columns: coldef
	});

	me.callParent();

	updateGrid();
	rstore.on("load", load_cb);
    }
});Ext.define('PVE.pool.AddVM', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	/*jslint confusion: true */
	var me = this;

	if (!me.pool) {
	    throw "no pool specified";
	}

	me.create = true;
	me.isAdd = true;
	me.url = "/pools/" + me.pool;
	me.method = 'PUT';
	
	Ext.apply(me, {
	    subject: gettext('Virtual Machine'),
	    width: 350,
	    items: [
		{
		    xtype: 'pveVMIDSelector',
		    name: 'vms',
		    validateExists: true,
		    value:  '',
		    fieldLabel: "VM ID"
		}
	    ]
	});

	me.callParent();
    }
});

Ext.define('PVE.pool.AddStorage', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	/*jslint confusion: true */
	var me = this;

	if (!me.pool) {
	    throw "no pool specified";
	}

	me.create = true;
	me.isAdd = true;
	me.url = "/pools/" + me.pool;
	me.method = 'PUT';
	
	Ext.apply(me, {
	    subject: gettext('Storage'),
	    width: 350,
	    items: [
		{
		    xtype: 'PVE.form.StorageSelector',
		    name: 'storage',
		    nodename: 'localhost',
		    autoSelect: false,
		    value:  '',
		    fieldLabel: gettext("Storage")
		}
	    ]
	});

	me.callParent();
    }
});

Ext.define('PVE.grid.PoolMembers', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pvePoolMembers'],

    // fixme: dynamic status update ?

    initComponent : function() {
	var me = this;

	if (!me.pool) {
	    throw "no pool specified";
	}

	var store = Ext.create('Ext.data.Store', {
	    model: 'PVEResources',
	    sorters: [
		{
		    property : 'type',
		    direction: 'ASC'
		}
	    ],
	    proxy: { 
		type: 'pve',
		root: 'data.members',
		url: "/api2/json/pools/" + me.pool
	    }
	});

	var coldef = PVE.data.ResourceStore.defaultColums();

	var reload = function() {
	    store.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: function (rec) {
		return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					 "'" + rec.data.id + "'");
	    },
	    handler: function(btn, event, rec) {
		var params = { 'delete': 1 };
		if (rec.data.type === 'storage') {
		    params.storage = rec.data.storage;
		} else if (rec.data.type === 'qemu' || rec.data.type === 'openvz') {
		    params.vms = rec.data.vmid;
		} else {
		    throw "unknown resource type";
		}

		PVE.Utils.API2Request({
		    url: '/pools/' + me.pool,
		    method: 'PUT',
		    params: params,
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    tbar: [
		{
		    text: gettext('Add'),
		    menu: new Ext.menu.Menu({
			items: [
			    {
				text: gettext('Virtual Machine'),
				iconCls: 'pve-itype-icon-qemu',
				handler: function() {
				    var win = Ext.create('PVE.pool.AddVM', { pool: me.pool });
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: gettext('Storage'),
				iconCls: 'pve-itype-icon-storage',
				handler: function() {
				    var win = Ext.create('PVE.pool.AddStorage', { pool: me.pool });
				    win.on('destroy', reload);
				    win.show();
				}
			    }
			]
		    })
		},
		remove_btn
	    ],
	    viewConfig: {
		stripeRows: true
            },
            columns: coldef,
	    listeners: {
		show: reload
	    }
	});

	me.callParent();
    }
});Ext.define('PVE.tree.ResourceTree', {
    extend: 'Ext.tree.TreePanel',
    alias: ['widget.pveResourceTree'],

    statics: {
	typeDefaults: {
	    node: { 
		iconCls: 'x-tree-node-server',
		text: gettext('Node list')
	    },
	    pool: { 
		iconCls: 'x-tree-node-pool',
		text: gettext('Resource Pool')
	    },
	    storage: {
		iconCls: 'x-tree-node-harddisk',
		text: gettext('Storage list')
	    },
	    qemu: {
		iconCls: 'x-tree-node-computer',
		text: gettext('Virtual Machine')
	    },
	    openvz: {
		iconCls: 'x-tree-node-openvz',
		text: gettext('OpenVZ Container')
	    } 
	}
    },

    // private
    nodeSortFn: function(node1, node2) {
	var n1 = node1.data;
	var n2 = node2.data;

	if ((n1.groupbyid && n2.groupbyid) ||
	    !(n1.groupbyid || n2.groupbyid)) {

	    var tcmp;

	    var v1 = n1.type;
	    var v2 = n2.type;

	    if ((tcmp = v1 > v2 ? 1 : (v1 < v2 ? -1 : 0)) != 0) {
		return tcmp;
	    }

	    // numeric compare for VM IDs
	    // sort templates after regular VMs
	    if (v1 === 'qemu' || v1 === 'openvz') {
		if (n1.template && !n2.template) {
		    return 1;
		} else if (n2.template && !n1.template) {
		    return -1;
		}
		v1 = n1.vmid;
		v2 = n2.vmid;
		if ((tcmp = v1 > v2 ? 1 : (v1 < v2 ? -1 : 0)) != 0) {
		    return tcmp;
		}
	    }

	    return n1.text > n2.text ? 1 : (n1.text < n2.text ? -1 : 0);
	} else if (n1.groupbyid) {
	    return -1;
	} else if (n2.groupbyid) {
	    return 1;
	}
    },

    // private: fast binary search
    findInsertIndex: function(node, child, start, end) {
	var me = this;

	var diff = end - start;

	var mid = start + (diff>>1);

	if (diff <= 0) {
	    return start;
	}

	var res = me.nodeSortFn(child, node.childNodes[mid]);
	if (res <= 0) {
	    return me.findInsertIndex(node, child, start, mid);
	} else {
	    return me.findInsertIndex(node, child, mid + 1, end);
	}
    },

    setIconCls: function(info) {
	var me = this;

	var defaults = PVE.tree.ResourceTree.typeDefaults[info.type];
	if (defaults && defaults.iconCls) {
	    var running = info.running ? '-running' : '';
	    var template = info.template ? '-template' : '';
	    info.iconCls = defaults.iconCls + running + template;
	}
    },

    // private
    addChildSorted: function(node, info) {
	var me = this;

	me.setIconCls(info);

	var defaults;
	if (info.groupbyid) {
	    info.text = info.groupbyid;	    
	    if (info.type === 'type') {
		defaults = PVE.tree.ResourceTree.typeDefaults[info.groupbyid];
		if (defaults && defaults.text) {
		    info.text = defaults.text;
		}
	    }
	}
	var child = Ext.ModelMgr.create(info, 'PVETree', info.id);

        var cs = node.childNodes;
	var pos;
	if (cs) {
	    pos = cs[me.findInsertIndex(node, child, 0, cs.length)];
	}

	node.insertBefore(child, pos);

	return child;
    },

    // private
    groupChild: function(node, info, groups, level) {
	var me = this;

	var groupby = groups[level];
	var v = info[groupby];

	if (v) {
            var group = node.findChild('groupbyid', v);
	    if (!group) {
		var groupinfo;
		if (info.type === groupby) {
		    groupinfo = info;
		} else {
		    groupinfo = {
			type: groupby,
			id : groupby + "/" + v
		    };
		    if (groupby !== 'type') {
			groupinfo[groupby] = v;
		    }
		}
		groupinfo.leaf = false;
		groupinfo.groupbyid = v; 
		group = me.addChildSorted(node, groupinfo);
		// fixme: remove when EXTJS has fixed those bugs?!
		group.expand(); group.collapse();
	    }
	    if (info.type === groupby) {
		return group;
	    }
	    if (group) {
		return me.groupChild(group, info, groups, level + 1);
	    }
	}

	return me.addChildSorted(node, info);
    },

    initComponent : function() {
	var me = this;

	var rstore = PVE.data.ResourceStore;
	var sp = Ext.state.Manager.getProvider();

	if (!me.viewFilter) {
	    me.viewFilter = {};
	}

	var pdata = {
	    dataIndex: {},
	    updateCount: 0
	};

	var store = Ext.create('Ext.data.TreeStore', {
	    model: 'PVETree',
	    root: {
		expanded: true,
		id: 'root',
		text: gettext('Datacenter')
	    }
	});

	var stateid = 'rid';

	var updateTree = function() {
	    var tmp;

	    // fixme: suspend events ?

	    var rootnode = me.store.getRootNode();
	    
	    // remember selected node (and all parents)
	    var sm = me.getSelectionModel();

	    var lastsel = sm.getSelection()[0];
	    var parents = [];
	    var p = lastsel;
	    while (p && !!(p = p.parentNode)) {
		parents.push(p);
	    }

	    var index = pdata.dataIndex;

	    var groups = me.viewFilter.groups || [];
	    var filterfn = me.viewFilter.filterfn;

	    // remove vanished or changed items
	    var key;
	    for (key in index) {
		if (index.hasOwnProperty(key)) {
		    var olditem = index[key];

		    // getById() use find(), which is slow (ExtJS4 DP5) 
		    //var item = rstore.getById(olditem.data.id);
		    var item = rstore.data.get(olditem.data.id);

		    var changed = false;
		    if (item) {
			// test if any grouping attributes changed
			var i, len;
			for (i = 0, len = groups.length; i < len; i++) {
			    var attr = groups[i];
			    if (item.data[attr] != olditem.data[attr]) {
				//console.log("changed " + attr);
				changed = true;
				break;
			    }
			}
			if ((item.data.text !== olditem.data.text) ||
			    (item.data.node !== olditem.data.node) ||
			    (item.data.running !== olditem.data.running) ||
			    (item.data.template !== olditem.data.template)) {
			    //console.log("changed node/text/running " + olditem.data.id);
			    changed = true;
			}

			// fixme: also test filterfn()?
		    }

		    if (!item || changed) {
			//console.log("REM UID: " + key + " ITEM " + olditem.data.id);
			if (olditem.isLeaf()) {
			    delete index[key];
			    var parentNode = olditem.parentNode;
			    parentNode.removeChild(olditem, true);
			} else {
			    if (item && changed) {
				olditem.beginEdit();
				//console.log("REM UPDATE UID: " + key + " ITEM " + item.data.running);
				var info = olditem.data;
				Ext.apply(info, item.data);
				me.setIconCls(info);
				olditem.commit();
			    }
			}
		    }
		}
	    }

	    // add new items
            rstore.each(function(item) {
		var olditem = index[item.data.id];
		if (olditem) {
		    return;
		}

		if (filterfn && !filterfn(item)) {
		    return;
		}

		//console.log("ADD UID: " + item.data.id);

		var info = Ext.apply({ leaf: true }, item.data);

		var child = me.groupChild(rootnode, info, groups, 0);
		if (child) {
		    index[item.data.id] = child;
		}
	    });

	    // select parent node is selection vanished
	    if (lastsel && !rootnode.findChild('id', lastsel.data.id, true)) {
		lastsel = rootnode;
		while (!!(p = parents.shift())) {
		    if (!!(tmp = rootnode.findChild('id', p.data.id, true))) {
			lastsel = tmp;
			break;
		    }
		}
		me.selectById(lastsel.data.id);
	    }

	    if (!pdata.updateCount) {
		rootnode.collapse();
		rootnode.expand();
		me.applyState(sp.get(stateid));
	    }

	    pdata.updateCount++;
	};

	var statechange = function(sp, key, value) {
	    if (key === stateid) {
		me.applyState(value);
	    }
	};

	sp.on('statechange', statechange);

	Ext.apply(me, {
	    store: store,
	    viewConfig: {
		// note: animate cause problems with applyState
		animate: false
	    },
	    //useArrows: true,
            //rootVisible: false,
            //title: 'Resource Tree',
	    listeners: {
		itemcontextmenu: function(v, record, item, index, event) {
		    event.stopEvent();
		    //v.select(record);
		    var menu;
		    
		    if (record.data.type === 'qemu' && !record.data.template) {
			menu = Ext.create('PVE.qemu.CmdMenu', {
			    pveSelNode: record
			});
		    } else if (record.data.type === 'qemu' && record.data.template) {
			menu = Ext.create('PVE.qemu.TemplateMenu', {
			    pveSelNode: record
			});
		    } else if (record.data.type === 'openvz') {
			menu = Ext.create('PVE.openvz.CmdMenu', {
			    pveSelNode: record
			});
		    } else {
			return;
		    }

		    menu.showAt(event.getXY());
		},
		destroy: function() {
		    rstore.un("load", updateTree);
		}
	    },
	    setViewFilter: function(view) {
		me.viewFilter = view;
		me.clearTree();
		updateTree();
	    },
	    clearTree: function() {
		pdata.updateCount = 0;
		var rootnode = me.store.getRootNode();
		rootnode.collapse();
		rootnode.removeAll(true);
		pdata.dataIndex = {};
		me.getSelectionModel().deselectAll();
	    },
	    selectExpand: function(node) {
		var sm = me.getSelectionModel();
		if (!sm.isSelected(node)) {
		    sm.select(node);
		    var cn = node;
		    while (!!(cn = cn.parentNode)) {
			if (!cn.isExpanded()) {
			    cn.expand();
			}
		    }
		}
	    },
	    selectById: function(nodeid) {
		var rootnode = me.store.getRootNode();
		var sm = me.getSelectionModel();
		var node;
		if (nodeid === 'root') {
		    node = rootnode;
		} else {
		    node = rootnode.findChild('id', nodeid, true);
		}
		if (node) {
		    me.selectExpand(node);
		}
	    },
	    checkVmMigration: function(record) {
		if (!(record.data.type === 'qemu' || record.data.type === 'openvz')) {
		    throw "not a vm type";
		}

		var rootnode = me.store.getRootNode();
		var node = rootnode.findChild('id', record.data.id, true);

		if (node && node.data.type === record.data.type &&
		    node.data.node !== record.data.node) {
		    // defer select (else we get strange errors)
		    Ext.defer(function() { me.selectExpand(node); }, 100, me);
		}
	    },
	    applyState : function(state) {
		var sm = me.getSelectionModel();
		if (state && state.value) {
		    me.selectById(state.value);
		} else {
		    sm.deselectAll();
		}
	    }
	});

	me.callParent();

	var sm = me.getSelectionModel();
	sm.on('select', function(sm, n) {		    
	    sp.set(stateid, { value: n.data.id});
	});

	rstore.on("load", updateTree);
	rstore.startUpdate();
	//rstore.stopUpdate();
    }

});
Ext.define('PVE.panel.Config', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pvePanelConfig',

    initComponent: function() {
        var me = this;

	var stateid = me.hstateid;

	var sp = Ext.state.Manager.getProvider();

	var activeTab;

	if (stateid) {
	    var state = sp.get(stateid);
	    if (state && state.value) {
		activeTab = state.value;
	    }
	}

	var items = me.items || [];
	me.items = undefined;

	var tbar = me.tbar || [];
	me.tbar = undefined;

	var title = me.title || me.pveSelNode.data.text;
	me.title = undefined;

	tbar.unshift('->');
	tbar.unshift({
	    xtype: 'tbtext',
	    text: title,
	    baseCls: 'x-panel-header-text',
	    padding: '0 0 5 0'
	});

	Ext.applyIf(me, { showSearch: true });

	if (me.showSearch) {
	    items.unshift({
		itemId: 'search', 
		xtype: 'pveResourceGrid'
	    });
	}

	var toolbar = Ext.create('Ext.toolbar.Toolbar', {
	    items: tbar,
	    style: 'border:0px;',
	    height: 28
	});

	var tab = Ext.create('Ext.tab.Panel', {
	    flex: 1,
	    border: true,
	    activeTab: activeTab,
	    defaults: Ext.apply(me.defaults ||  {}, {
		pveSelNode: me.pveSelNode,
		viewFilter: me.viewFilter,
		workspace: me.workspace,
		border: false
	    }),
	    items: items,
	    listeners: {
		afterrender: function(tp) {
		    var first =  tp.items.get(0);
		    if (first) {
			first.fireEvent('show', first);
		    }
		},
		tabchange: function(tp, newcard, oldcard) {
		    var ntab = newcard.itemId;
		    // Note: '' is alias for first tab.
		    // First tab can be 'search' or something else
		    if (newcard.itemId === items[0].itemId) {
			ntab = '';
		    }
		    var state = { value: ntab };
		    if (stateid) {
			sp.set(stateid, state);
		    }
		}
	    }
	});

	Ext.apply(me, {
	    layout: { type: 'vbox', align: 'stretch' },
	    items: [ toolbar, tab]
	});

	me.callParent();

	var statechange = function(sp, key, state) {
	    if (stateid && key === stateid) {
		var atab = tab.getActiveTab().itemId;
		var ntab = state.value || items[0].itemId;
		if (state && ntab && (atab != ntab)) {
		    tab.setActiveTab(ntab);
		}
	    }
	};

	if (stateid) {
	    me.mon(sp, 'statechange', statechange);
	}
    }
});
Ext.define('PVE.grid.BackupView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveBackupView'],


    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var vmtype = me.pveSelNode.data.type;
	if (!vmtype) {
	    throw "no VM type specified";
	}

	var filterFn;
	if (vmtype === 'openvz') {
	    filterFn = function(item) {
		return item.data.volid.match(':backup/vzdump-openvz-');
	    };
	} else if (vmtype === 'qemu') {
	    filterFn = function(item) {
		return item.data.volid.match(':backup/vzdump-qemu-');
	    };
	} else {
	    throw "unsupported VM type '" + vmtype + "'";
	}

	me.store = Ext.create('Ext.data.Store', {
	    model: 'pve-storage-content',
	    sorters: { 
		property: 'volid', 
		order: 'DESC' 
	    },
	    filters: { filterFn: filterFn }
	});

	var reload = Ext.Function.createBuffered(function() {
	    if (me.store.proxy.url) {
		me.store.load();
	    }
	}, 100);

	var setStorage = function(storage) {
	    var url = '/api2/json/nodes/' + nodename + '/storage/' + storage + '/content';
	    url += '?content=backup';

	    me.store.setProxy({
		type: 'pve',
		url: url
	    });

	    reload();
	};

	var storagesel = Ext.create('PVE.form.StorageSelector', {
	    nodename: nodename,
	    fieldLabel: gettext('Storage'),
	    labelAlign: 'right',
	    storageContent: 'backup',
	    allowBlank: false,
	    listeners: {
		change: function(f, value) {
		    setStorage(value);
		}
	    }
	});

	var sm = Ext.create('Ext.selection.RowModel', {});

	var backup_btn = Ext.create('Ext.button.Button', {
	    text: gettext('Backup now'),
	    handler: function() {
		var win = Ext.create('PVE.window.Backup', { 
		    nodename: nodename,
		    vmid: vmid,
		    vmtype: vmtype,
		    storage: storagesel.getValue()
		});
		win.show();
	    }
	});

	var restore_btn = Ext.create('PVE.button.Button', {
	    text: gettext('Restore'),
	    disabled: true,
	    selModel: sm,
	    enableFn: function(rec) {
		return !!rec;
	    },
	    handler: function(b, e, rec) {
		var volid = rec.data.volid;

		var win = Ext.create('PVE.window.Restore', {
		    nodename: nodename,
		    vmid: vmid,
		    volid: rec.data.volid,
		    volidText: PVE.Utils.render_storage_content(rec.data.volid, {}, rec),
		    vmtype: vmtype
		});
		win.show();
		win.on('destroy', reload);
	    }
	});

	var delete_btn = Ext.create('PVE.button.Button', {
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    dangerous: true,	    
	    confirmMsg: function(rec) {
		var msg = Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					    "'" + rec.data.volid + "'");
		msg += " " + gettext('This will permanently erase all image data.');

		return msg;
	    },
	    enableFn: function(rec) {
		return !!rec;
	    },
	    handler: function(b, e, rec){
		var storage = storagesel.getValue();
		if (!storage) {
		    return;
		}

		var volid = rec.data.volid;
		PVE.Utils.API2Request({
		    url: "/nodes/" + nodename + "/storage/" + storage + "/content/" + volid,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    failure: function(response, opts) {
			Ext.Msg.alert('Error', response.htmlStatus);
		    },
		    success: function(response, options) {
			reload();
		    }
		});
	    }
	});

	Ext.apply(me, {
	    stateful: false,
	    selModel: sm,
	    tbar: [ backup_btn, restore_btn, delete_btn, '->', storagesel ],
	    columns: [
		{
		    header: gettext('Name'),
		    flex: 1,
		    sortable: true,
		    renderer: PVE.Utils.render_storage_content,
		    dataIndex: 'volid'
		},
		{
		    header: gettext('Format'),
		    width: 100,
		    dataIndex: 'format'
		},
		{
		    header: gettext('Size'),
		    width: 100,
		    renderer: PVE.Utils.format_size,
		    dataIndex: 'size'
		}
	    ],
	    listeners: {
		show: reload
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.panel.LogView', {
    extend: 'Ext.panel.Panel',

    alias: ['widget.pveLogView'],

    pageSize: 500,

    lineHeight: 16,

    viewInfo: undefined,

    scrollToEnd: true,

    getMaxDown: function(scrollToEnd) {
        var me = this;

	var target = me.getTargetEl();
	var dom = target.dom;
	if (scrollToEnd) {
	    dom.scrollTop = dom.scrollHeight - dom.clientHeight;
	}

	var maxDown = dom.scrollHeight - dom.clientHeight - 
	    dom.scrollTop;

	return maxDown;
    },

    updateView: function(start, end, total, text) {
        var me = this;
	var el = me.dataCmp.el;

	if (me.viewInfo && me.viewInfo.start === start &&
	    me.viewInfo.end === end && me.viewInfo.total === total &&
	    me.viewInfo.textLength === text.length) {
	    return; // same content
	}

	var maxDown = me.getMaxDown();
	var scrollToEnd = (maxDown <= 0) && me.scrollToEnd;

	el.setStyle('padding-top', start*me.lineHeight);
	el.update(text);
	me.dataCmp.setHeight(total*me.lineHeight);

	if (scrollToEnd) {
	    me.getMaxDown(true);
	}

	me.viewInfo = {
	    start: start,
	    end: end,
	    total: total,
	    textLength:  text.length
	};
    },

    doAttemptLoad: function(start) {
        var me = this;

	PVE.Utils.API2Request({
	    url: me.url,
	    params: {
		start: start,
		limit: me.pageSize
	    },
	    method: 'GET',
	    success: function(response) {
		PVE.Utils.setErrorMask(me, false);
		var list = response.result.data;
		var total = response.result.total;
		var first = 0, last = 0;
		var text = '';
		Ext.Array.each(list, function(item) {
		    if (!first|| item.n < first) {
			first = item.n;
		    }
		    if (!last || item.n > last) {
			last = item.n;
		    }
		    text = text + Ext.htmlEncode(item.t) + "<br>";
		});

		if (first && last && total) {
		    me.updateView(first -1 , last -1, total, text);
		} else {
		    me.updateView(0, 0, 0, '');
		}
	    },
	    failure: function(response) {
		var msg = response.htmlStatus;
		PVE.Utils.setErrorMask(me, msg);
	    }
	});			      
    },

    attemptLoad: function(start) {
        var me = this;
        if (!me.loadTask) {
            me.loadTask = Ext.create('Ext.util.DelayedTask', me.doAttemptLoad, me, []);
        }
        me.loadTask.delay(200, me.doAttemptLoad, me, [start]);
    },

    requestUpdate: function(top, force) {
	var me = this;

	if (top === undefined) {
	    var target = me.getTargetEl();
	    top = target.dom.scrollTop;
	}

	var viewStart = parseInt((top / me.lineHeight) - 1, 10);
	if (viewStart < 0) {
	    viewStart = 0;
	}
	var viewEnd = parseInt(((top + me.getHeight())/ me.lineHeight) + 1, 10);
	var info = me.viewInfo;

	if (info && !force) {
	    if (viewStart >= info.start && viewEnd <= info.end) {
		return;
	    }
	}

	var line = parseInt((top / me.lineHeight) - (me.pageSize / 2) + 10, 10);
	if (line < 0) {
	    line = 0;
	}

	me.attemptLoad(line);
    },

    afterRender: function() {
	var me = this;

        me.callParent(arguments);
 
	Ext.Function.defer(function() {
	    var target = me.getTargetEl();
	    target.on('scroll',  function(e) {
		me.requestUpdate();
	    });
	    me.requestUpdate(0);
	}, 20);
    },

    initComponent : function() {
	/*jslint confusion: true */

	var me = this;

	if (!me.url) {
	    throw "no url specified";
	}

	me.dataCmp = Ext.create('Ext.Component', {
	    style: 'font:normal 11px tahoma, arial, verdana, sans-serif;' +
		'line-height: ' + me.lineHeight.toString() + 'px; white-space: pre;'
	});

	me.task = Ext.TaskManager.start({
	    run: function() {
		if (!me.isVisible() || !me.scrollToEnd || !me.viewInfo) {
		    return;
		}
		
		var maxDown = me.getMaxDown();
		if (maxDown > 0) {
		    return;
		}

		me.requestUpdate(undefined, true);
	    },
	    interval: 1000
	});

	Ext.apply(me, {
	    autoScroll: true,
	    layout: 'auto',
	    items: me.dataCmp,
	    bodyStyle: 'padding: 5px;',
	    listeners: {
		show: function() {
		    var target = me.getTargetEl();
		    if (target && target.dom) {
			target.dom.scrollTop = me.savedScrollTop;
		    }
		},
		beforehide: function() {
		    // Hack: chrome reset scrollTop to 0, so we save/restore
		    var target = me.getTargetEl();
		    if (target && target.dom) {
			me.savedScrollTop = target.dom.scrollTop;
		    }
		},
		destroy: function() {
		    Ext.TaskManager.stop(me.task);
		}
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.node.DNSEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveNodeDNSEdit'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	me.items = [
	    {
		xtype: 'textfield',
                fieldLabel: 'Search domain',
                name: 'search',
                allowBlank: false
	    },
	    {
		xtype: 'pvetextfield',
                fieldLabel: gettext('DNS server') + " 1",
		vtype: 'IPAddress',
		skipEmptyText: true,
                name: 'dns1'
	    },
	    {
		xtype: 'pvetextfield',
		fieldLabel: gettext('DNS server') + " 2",
		vtype: 'IPAddress',
		skipEmptyText: true,
                name: 'dns2'
	    },
	    {
		xtype: 'pvetextfield',
                fieldLabel: gettext('DNS server') + " 3",
		vtype: 'IPAddress',
		skipEmptyText: true,
                name: 'dns3'
	    }
	];

	Ext.applyIf(me, {
	    subject: 'DNS',
	    url: "/api2/extjs/nodes/" + nodename + "/dns",
	    fieldDefaults: {
		labelWidth: 120
	    }
	});

	me.callParent();

	me.load();
    }
});
Ext.define('PVE.node.DNSView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveNodeDNSView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var run_editor = function() {
	    var win = Ext.create('PVE.node.DNSEdit', { 
		pveSelNode: me.pveSelNode
	    });
	    win.show();
	};

	Ext.applyIf(me, {
	    url: "/api2/json/nodes/" + nodename + "/dns",
	    cwidth1: 130,
	    interval: 1000,
	    rows: {
		search: { header: 'Search domain', required: true },
		dns1: { header: gettext('DNS server') + " 1", required: true },
		dns2: { header: gettext('DNS server') + " 2" },
		dns3: { header: gettext('DNS server') + " 3" }
	    },
	    tbar: [ 
		{
		    text: gettext("Edit"),
		    handler: run_editor
		}
	    ],
	    listeners: {
		itemdblclick: run_editor
	    }
	});

	me.callParent();

	me.on('show', me.rstore.startUpdate);
	me.on('hide', me.rstore.stopUpdate);
	me.on('destroy', me.rstore.stopUpdate);	
    }
});
Ext.define('PVE.node.TimeView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveNodeTimeView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var tzoffset = (new Date()).getTimezoneOffset()*60000;
	var renderlocaltime = function(value) {
	    var servertime = new Date((value * 1000) + tzoffset);
	    return Ext.Date.format(servertime, 'Y-m-d H:i:s');
	};

	var run_editor = function() {
	    var win = Ext.create('PVE.node.TimeEdit', {
		pveSelNode: me.pveSelNode
	    });
	    win.show();
	};

	Ext.applyIf(me, {
	    url: "/api2/json/nodes/" + nodename + "/time",
	    cwidth1: 150,
	    interval: 1000,
	    rows: {
		timezone: { 
		    header: gettext('Time zone'), 
		    required: true
		},
		localtime: { 
		    header: gettext('Server time'), 
		    required: true, 
		    renderer: renderlocaltime 
		}
	    },
	    tbar: [ 
		{
		    text: gettext("Edit"),
		    handler: run_editor
		}
	    ],
	    listeners: {
		itemdblclick: run_editor
	    }
	});

	me.callParent();

	me.on('show', me.rstore.startUpdate);
	me.on('hide', me.rstore.stopUpdate);
	me.on('destroy', me.rstore.stopUpdate);	
    }
});
Ext.define('PVE.node.TimeEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveNodeTimeEdit'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	Ext.applyIf(me, {
	    subject: gettext('Time zone'),
	    url: "/api2/extjs/nodes/" + nodename + "/time",
	    fieldDefaults: {
		labelWidth: 70
            },
	    width: 400,
	    items: {
		xtype: 'combo',
		fieldLabel: gettext('Time zone'),
		name: 'timezone',
		queryMode: 'local',
		store: new PVE.data.TimezoneStore({autoDestory: true}),
		valueField: 'zone',
		displayField: 'zone',
		triggerAction: 'all',
		forceSelection: true,
		editable: false,
		allowBlank: false
	    }
	});

	me.callParent();

	me.load();
    }
});
Ext.define('PVE.node.StatusView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveNodeStatusView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var render_cpuinfo = function(value) {
	    return value.cpus + " x " + value.model + " (" + 
		value.sockets.toString() + " " + 
		(value.sockets > 1 ? "Sockets" : "Socket") + ")";
	};

	var render_loadavg = function(value) {
	    return value[0] + ", " + value[1] + ", " + value[2]; 
	};

	var render_cpu = function(value) {
	    var per = value * 100;
	    return per.toFixed(2) + "%";
	};

	var render_ksm = function(value) {
	    return PVE.Utils.format_size(value.shared);
	};

	var render_meminfo = function(value) {
	    var per = (value.used / value.total)*100;
	    var text = "<div>Total: " + PVE.Utils.format_size(value.total) + "</div>" + 
		"<div>Used: " + PVE.Utils.format_size(value.used) + "</div>";
	    return text;
	};

	var rows = {
	    uptime: { header: 'Uptime', required: true, renderer: PVE.Utils.format_duration_long },
	    loadavg: { header: 'Load average', required: true, renderer: render_loadavg },
	    cpuinfo: { header: 'CPUs', required: true, renderer: render_cpuinfo },
	    cpu: { header: 'CPU usage',required: true,  renderer: render_cpu },
	    wait: { header: 'IO delay', required: true, renderer: render_cpu },
	    memory: { header: 'RAM usage', required: true, renderer: render_meminfo },
	    swap: { header: 'SWAP usage', required: true, renderer: render_meminfo },
	    ksm: { header: 'KSM sharing', required: true, renderer: render_ksm },
	    rootfs: { header: 'HD space (root)', required: true, renderer: render_meminfo },
	    pveversion: { header: 'PVE Manager version', required: true },
	    kversion: { header: 'Kernel version', required: true }
	};

	Ext.applyIf(me, {
	    cwidth1: 150,
	    //height: 276,
	    rows: rows
	});

	me.callParent();
    }
});
/*jslint confusion: true */
Ext.define('PVE.node.BCFailCnt', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveNodeBCFailCnt'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var store = new Ext.data.Store({
	    model: 'pve-openvz-ubc',
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes/' + nodename + '/ubcfailcnt'
	    },
	    sorters: [
		{
		    property : 'id',
		    direction: 'ASC'
		}
	    ]
	});

	var reload = function() {
	    store.load();
	};

	Ext.applyIf(me, {
	    store: store,
	    stateful: false,
	    columns: [
		{
		    header: 'Container',
		    width: 100,
		    dataIndex: 'id'
		},
		{
		    header: 'failcnt',
		    flex: 1,
		    dataIndex: 'failcnt'
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: function(v, record) {
		    var ws = me.up('pveStdWorkspace');
		    ws.selectById('openvz/' + record.data.id);
		}
	    }
	});

	me.callParent();

   }
}, function() {

    Ext.define('pve-openvz-ubc', {
	extend: "Ext.data.Model",
	fields: [ 'id', { name: 'failcnt', type: 'number' } ]
    });

});
Ext.define('PVE.node.Summary', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pveNodeSummary',

    showVersions: function() {
	var me = this;

	// Note: we use simply text/html here, because ExtJS grid has problems
	// with cut&paste

	var nodename = me.pveSelNode.data.node;

	var view = Ext.createWidget('component', {
	    autoScroll: true,
	    style: {
		'background-color': 'white',
		'white-space': 'pre',
		'font-family': 'monospace',
		padding: '5px'
	    }
	});

	var win = Ext.create('Ext.window.Window', {
	    title: gettext('Package versions'),
	    width: 600,
	    height: 400,
	    layout: 'fit',
	    modal: true,
	    items: [ view ] 
	});

	PVE.Utils.API2Request({
	    waitMsgTarget: me,
	    url: "/nodes/" + nodename + "/apt/versions",
	    method: 'GET',
	    failure: function(response, opts) {
		win.close();
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, opts) {
		win.show();
		var text = '';

		Ext.Array.each(response.result.data, function(rec) {
		    var version = "not correctly installed";
		    var pkg = rec.Package;
		    if (rec.OldVersion && rec.CurrentState === 'Installed') {
			version = rec.OldVersion;
		    }
		    if (rec.RunningKernel) {
			text += pkg + ': ' + version + ' (running kernel: ' +
			    rec.RunningKernel + ')\n'; 
		    } else if (rec.ManagerVersion) {
			text += pkg + ': ' + version + ' (running version: ' +
			    rec.ManagerVersion + ')\n'; 
		    } else {
			text += pkg + ': ' + version + '\n'; 
		    }
		});

		view.update(Ext.htmlEncode(text));
	    }
	});
    },

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	if (!me.statusStore) {
	    throw "no status storage specified";
	}

	var rstore = me.statusStore;

	var statusview = Ext.create('PVE.node.StatusView', {
	    title: 'Status',
	    pveSelNode: me.pveSelNode,
	    style: { 'padding-top': '0px' },
	    rstore: rstore
	});

	var rrdurl = "/api2/png/nodes/" + nodename + "/rrd";
  
	var version_btn = new Ext.Button({
	    text: gettext('Package versions'),
	    handler: function(){
		PVE.Utils.checked_command(function() { me.showVersions(); });
	    }
	});

	Ext.apply(me, {
	    autoScroll: true,
	    bodyStyle: 'padding:10px',
	    defaults: {
		width: 800,
		style: { 'padding-top': '10px' }
	    },		
	    tbar: [version_btn, '->', { xtype: 'pveRRDTypeSelector' } ],
	    items: [
		statusview,
		{
		    xtype: 'pveRRDView',
		    title: "CPU usage %",
		    datasource: 'cpu,iowait',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Server load",
		    datasource: 'loadavg',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Memory usage",
		    datasource: 'memtotal,memused',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Network traffic",
		    datasource: 'netin,netout',
		    rrdurl: rrdurl
		}
	    ],
	    listeners: {
		show: rstore.startUpdate,
		hide: rstore.stopUpdate,
		destroy: rstore.stopUpdate
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.node.ServiceView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveNodeServiceView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var rstore = Ext.create('PVE.data.UpdateStore', {
	    interval: 1000,
	    storeid: 'pve-services',
	    model: 'pve-services',
	    proxy: {
                type: 'pve',
                url: "/api2/json/nodes/" + nodename + "/services"
	    }
	});

	var store = Ext.create('PVE.data.DiffStore', { rstore: rstore });

	var service_cmd = function(cmd) {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];
	    PVE.Utils.API2Request({
		url: "/nodes/" + nodename + "/services/" + rec.data.service + "/" + cmd,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		    me.loading = true;
		},
		success: function(response, opts) {
		    rstore.startUpdate();
		    var upid = response.result.data;

		    var win = Ext.create('PVE.window.TaskViewer', { 
			upid: upid
		    });
		    win.show();
		}
	    });
	};

	var start_btn = new Ext.Button({
	    text: gettext('Start'),
	    disabled: true,
	    handler: function(){
		service_cmd("start");
	    }
	});

	var stop_btn = new Ext.Button({
	    text: gettext('Stop'),
	    disabled: true,
	    handler: function(){
		service_cmd("stop");
	    }
	});

	var restart_btn = new Ext.Button({
	    text: gettext('Restart'),
	    disabled: true,
	    handler: function(){
		service_cmd("restart");
	    }
	});

	var set_button_status = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];

	    if (!rec) {
		start_btn.disable();
		stop_btn.disable();
		restart_btn.disable();
		return;
	    }
	    var service = rec.data.service;
	    var state = rec.data.state;
	    if (service == 'pveproxy' ||
		service == 'pvecluster' ||
		service == 'pvedaemon') {
		if (state == 'running') {
		    start_btn.disable();
		    restart_btn.enable();
		} else {
		    start_btn.enable();
		    restart_btn.disable();
		}
		stop_btn.disable();
	    } else {
		if (state == 'running') {
		    start_btn.disable();
		    restart_btn.enable();
		    stop_btn.enable();
		} else {
		    start_btn.enable();
		    restart_btn.disable();
		    stop_btn.disable();
		}
	    }
	};

	me.mon(store, 'datachanged', set_button_status);

	PVE.Utils.monStoreErrors(me, rstore);

	Ext.apply(me, {
	    store: store,
	    stateful: false,
	    tbar: [ start_btn, stop_btn, restart_btn ],
	    columns: [
		{
		    header: gettext('Name'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'name'
		},
		{
		    header: gettext('Status'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'state'
		},
		{
		    header: gettext('Description'),
		    dataIndex: 'desc',
		    flex: 1
		}
	    ],
	    listeners: {
		selectionchange: set_button_status,
		show: rstore.startUpdate,
		hide: rstore.stopUpdate,
		destroy: rstore.stopUpdate
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('pve-services', {
	extend: 'Ext.data.Model',
	fields: [ 'service', 'name', 'desc', 'state' ],
	idProperty: 'service'
    });

});
Ext.define('PVE.node.NetworkEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveNodeNetworkEdit'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	if (!me.iftype) {
	    throw "no network device type specified";
	}

	me.create = !me.iface;

	var iface_vtype;

	if (me.iftype === 'bridge') {
	    me.subject = "Bridge";
	    iface_vtype = 'BridgeName';
	} else if (me.iftype === 'bond') {
	    me.subject = "Bond";
	    iface_vtype = 'BondName';
	} else if (me.iftype === 'eth' && !me.create) {
	    me.subject = gettext("Network Device");
	} else {
	    throw "no known network device type specified";
	}

	var column2 = [
	    {
		xtype: 'pvecheckbox',
		fieldLabel: 'Autostart',
		name: 'autostart',
		uncheckedValue: 0,
		checked: me.create ? true : undefined
	    }
	];

	if (me.iftype === 'bridge') {
	    column2.push({
		xtype: 'textfield',
		fieldLabel: 'Bridge ports',
		name: 'bridge_ports'
	    });	  
	} else if (me.iftype === 'bond') {
	    column2.push({
		xtype: 'textfield',
		fieldLabel: 'Slaves',
		name: 'slaves'
	    });
	    column2.push({
		xtype: 'bondModeSelector',
		fieldLabel: 'Mode',
		name: 'bond_mode',
		value: me.create ? 'balance-rr' : undefined,
		allowBlank: false
	    });
	}

	var url;
	var method;

	if (me.create) {
	    url = "/api2/extjs/nodes/" + nodename + "/network";
	    method = 'POST';
	} else {
	    url = "/api2/extjs/nodes/" + nodename + "/network/" + me.iface;
	    method = 'PUT';
	}

	var column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		fieldLabel: gettext('Name'),
		height: 22, // hack: set same height as text fields
		name: 'iface',
		value: me.iface,
		vtype: iface_vtype,
		allowBlank: false
	    },
	    {
		xtype: 'pvetextfield',
		deleteEmpty: !me.create,
		fieldLabel: gettext('IP address'),
		vtype: 'IPAddress',
		name: 'address'
	    },
	    {
		xtype: 'pvetextfield',
		deleteEmpty: !me.create,
		fieldLabel: gettext('Subnet mask'),
		vtype: 'IPAddress',
		name: 'netmask',
		validator: function(value) {
		    /*jslint confusion: true */
		    if (!me.items) {
			return true;
		    }
		    var address = me.down('field[name=address]').getValue();
		    if (value !== '') {
			if (address === '') {
			    return "Subnet mask requires option 'IP address'";
			}
		    } else {
			if (address !== '') {
			    return "Option 'IP address' requires a subnet mask";
			}
		    }
		    
		    return true;
		}
	    },
	    {
		xtype: 'pvetextfield',
		deleteEmpty: !me.create,
		fieldLabel: 'Gateway',
		vtype: 'IPAddress',
		name: 'gateway'
	    }
	];

	Ext.applyIf(me, {
	    url: url,
	    method: method,
	    items: {
                xtype: 'inputpanel',
		column1: column1,
		column2: column2
	    }
	});

	me.callParent();

	if (me.create) {
	    me.down('field[name=iface]').setValue(me.iface_default);
	} else {
	    me.load({
		success: function(response, options) {
		    var data = response.result.data;
		    if (data.type !== me.iftype) {
			var msg = "Got unexpected device type";
			Ext.Msg.alert(gettext('Error'), msg, function() {
			    me.close();
			});
			return;
		    }
		    me.setValues(data);
		    me.isValid(); // trigger validation
		}
	    });
	}
    }
});
Ext.define('PVE.node.NetworkView', {
    extend: 'Ext.panel.Panel',

    alias: ['widget.pveNodeNetworkView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var store = Ext.create('Ext.data.Store', {
	    model: 'pve-networks',
	    proxy: {
                type: 'pve',
                url: "/api2/json/nodes/" + nodename + "/network"
	    },
	    sorters: [
		{
		    property : 'iface',
		    direction: 'ASC'
		}
	    ]
	});

	var reload = function() {
	    var changeitem = me.down('#changes');
	    PVE.Utils.API2Request({
		url: '/nodes/' + nodename + '/network',
		failure: function(response, opts) {
		    changeitem.update('Error: ' + response.htmlStatus);
		    store.loadData({});
		},
		success: function(response, opts) {
		    var result = Ext.decode(response.responseText);
		    store.loadData(result.data);
		    var changes = result.changes;
		    if (changes === undefined || changes === '') {
			changes = gettext("No changes");
		    }
		    changeitem.update("<pre>" + Ext.htmlEncode(changes) + "</pre>");
		}
	    });
	};

	var run_editor = function() {
	    var grid = me.down('gridpanel');
	    var sm = grid.getSelectionModel();
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.create('PVE.node.NetworkEdit', {
		pveSelNode: me.pveSelNode,
		iface: rec.data.iface,
		iftype: rec.data.type
	    });
	    win.show();
	    win.on('destroy', reload);
	};

	var edit_btn = new Ext.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    handler: run_editor
	});

	var del_btn = new Ext.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    handler: function(){
		var grid = me.down('gridpanel');
		var sm = grid.getSelectionModel();
		var rec = sm.getSelection()[0];
		if (!rec) {
		    return;
		}

		var iface = rec.data.iface;

		PVE.Utils.API2Request({
		    url: '/nodes/' + nodename + '/network/' + iface,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function(response, opts) {
			Ext.Msg.alert('Error', response.htmlStatus);
		    }
		});
	    }
	});

	var set_button_status = function() {
	    var grid = me.down('gridpanel');
	    var sm = grid.getSelectionModel();
	    var rec = sm.getSelection()[0];

	    edit_btn.setDisabled(!rec);
	    del_btn.setDisabled(!rec);
	};

	PVE.Utils.monStoreErrors(me, store);

	var render_ports = function(value, metaData, record) {
	    if (value === 'bridge') {
		return record.data.bridge_ports;
	    } else if (value === 'bond') {
		return record.data.slaves;
	    }
	};

	Ext.apply(me, {
	    layout: 'border',
	    tbar: [
		{
		    text: gettext('Create'),
		    menu: new Ext.menu.Menu({
			items: [
			    {
				text: 'Bridge',
				handler: function() {
				    var next;
				    for (next = 0; next <= 9999; next++) {
					if (!store.data.get('vmbr' + next.toString())) {
					    break;
					}
				    }
				    
				    var win = Ext.create('PVE.node.NetworkEdit', {
					pveSelNode: me.pveSelNode,
					iftype: 'bridge',
					iface_default: 'vmbr' + next.toString()
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: 'Bond',
				handler: function() {
				    var next;
				    for (next = 0; next <= 9999; next++) {
					if (!store.data.get('bond' + next.toString())) {
					    break;
					}
				    }
				    var win = Ext.create('PVE.node.NetworkEdit', {
					pveSelNode: me.pveSelNode,
					iftype: 'bond',
					iface_default: 'bond' + next.toString()
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    } 
			]
		    })
		}, ' ', 
		{
		    text: gettext('Revert changes'),
		    handler: function() {
			PVE.Utils.API2Request({
			    url: '/nodes/' + nodename + '/network',
			    method: 'DELETE',
			    waitMsgTarget: me,
			    callback: function() {
				reload();
			    },
			    failure: function(response, opts) {
				Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			    }
			});
		    }
		},
		edit_btn, 
		del_btn
	    ],
	    items: [
		{
		    xtype: 'gridpanel',
		    stateful: false,
		    store: store,
		    region: 'center',
		    border: false,
		    columns: [
			{
			    header: gettext('Name'),
			    width: 100,
			    sortable: true,
			    dataIndex: 'iface'
			},
			{
			    xtype: 'booleancolumn', 
			    header: gettext('Active'),
			    width: 80,
			    sortable: true,
			    dataIndex: 'active',
			    trueText: 'Yes',
			    falseText: 'No',
			    undefinedText: 'No'
			},
			{
			    xtype: 'booleancolumn', 
			    header: 'Autostart',
			    width: 80,
			    sortable: true,
			    dataIndex: 'autostart',
			    trueText: 'Yes',
			    falseText: 'No',
			    undefinedText: 'No'
			},
			{
			    header: 'Ports/Slaves',
			    dataIndex: 'type',
			    renderer: render_ports
			},
			{
			    header: gettext('IP address'),
			    sortable: true,
			    dataIndex: 'address'
			},
			{
			    header: gettext('Subnet mask'),
			    sortable: true,
			    dataIndex: 'netmask'
			},
			{
			    header: 'Gateway',
			    sortable: true,
			    dataIndex: 'gateway'
			}
		    ],
		    listeners: {
			selectionchange: set_button_status,
			itemdblclick: run_editor
		    }
		},
		{
		    border: false,
		    region: 'south',
		    autoScroll: true,
		    itemId: 'changes',
		    tbar: [ 
			gettext('Pending changes') + ' (' +
			    gettext('Please reboot to activate changes') + ')'
		    ],
		    split: true, 
		    bodyPadding: 5,
		    flex: 0.6,
		    html: gettext("No changes")
		}
	    ],
	    listeners: {
		show: reload
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('pve-networks', {
	extend: 'Ext.data.Model',
	fields: [ 
	    'iface', 'type', 'active', 'autostart',
	    'bridge_ports', 'slaves', 'address',
	    'netmask', 'gateway'
	],
	idProperty: 'iface'
    });

});
    Ext.define('PVE.node.Tasks', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveNodeTasks'],

    vmidFilter: 0,

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var store = Ext.create('Ext.data.Store', {
	    pageSize: 500,
	    buffered: true,
	    remoteFilter: true,
	    model: 'pve-tasks',
	    proxy: {
                type: 'pve',
		startParam: 'start',
		limitParam: 'limit',
                url: "/api2/json/nodes/" + nodename + "/tasks"
	    }
	});

	var userfilter = '';
	var filter_errors = 0;

	var updateProxyParams = function() {
	    var params = {
		errors: filter_errors
	    };
	    if (userfilter) {
		params.userfilter = userfilter;
	    }
	    if (me.vmidFilter) {
		params.vmid = me.vmidFilter;
	    }
	    store.proxy.extraParams = params;
	};

	updateProxyParams();

	// fixme: scroller update fails 
	// http://www.sencha.com/forum/showthread.php?133677-scroller-does-not-adjust-to-the-filtered-grid-data&p=602887
	var reload_task = new Ext.util.DelayedTask(function() {
	    updateProxyParams();
	    store.filter();
	});

	var run_task_viewer = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.create('PVE.window.TaskViewer', { 
		upid: rec.data.upid
	    });
	    win.show();
	};

	var view_btn = new Ext.Button({
	    text: gettext('View'),
	    disabled: true,
	    handler: run_task_viewer
	});


	Ext.apply(me, {
	    store: store,
	    stateful: false,
	    verticalScrollerType: 'paginggridscroller',
	    loadMask: true,
	    invalidateScrollerOnRefresh: false,
	    viewConfig: {
		trackOver: false,
		stripeRows: false, // does not work with getRowClass()
 
		getRowClass: function(record, index) {
		    var status = record.get('status');

		    if (status && status != 'OK') {
			return "x-form-invalid-field";
		    }
		}
	    },
	    tbar: [
		view_btn, '->', gettext('User name') +':', ' ',
		{
		    xtype: 'textfield',
		    width: 200,
		    value: userfilter,
		    enableKeyEvents: true,
		    listeners: {
			keyup: function(field, e) {
			    userfilter = field.getValue();
			    reload_task.delay(500);
			}
		    }
		}, ' ', gettext('Only Errors') + ':', ' ',
		{
		    xtype: 'checkbox',
		    hideLabel: true,
		    checked: filter_errors,
		    listeners: {
			change: function(field, checked) {
			    filter_errors = checked ? 1 : 0;
			    reload_task.delay(10);
			}
		    }
		}, ' '
	    ],
	    sortableColumns: false,
	    columns: [
		{ 
		    header: gettext("Start Time"), 
		    dataIndex: 'starttime',
		    width: 100,
		    renderer: function(value) { 
			return Ext.Date.format(value, "M d H:i:s"); 
		    }
		},
		{ 
		    header: gettext("End Time"), 
		    dataIndex: 'endtime',
		    width: 100,
		    renderer: function(value, metaData, record) {
			return  Ext.Date.format(value,"M d H:i:s"); 
		    }
		},
		{ 
		    header: gettext("Node"), 
		    dataIndex: 'node',
		    width: 100
		},
		{ 
		    header: gettext("User name"), 
		    dataIndex: 'user',
		    width: 150
		},
		{ 
		    header: gettext("Description"), 
		    dataIndex: 'upid', 
		    flex: 1,
		    renderer: PVE.Utils.render_upid
		},
		{ 
		    header: gettext("Status"), 
		    dataIndex: 'status', 
		    width: 200,
		    renderer: function(value, metaData, record) { 
			if (value == 'OK') {
			    return 'OK';
			}
			// metaData.attr = 'style="color:red;"'; 
			return "ERROR: " + value;
		    }
		}
	    ],
	    listeners: {
		itemdblclick: run_task_viewer,
		selectionchange: function(v, selections) {
		    view_btn.setDisabled(!(selections && selections[0]));
		},
		show: function() { reload_task.delay(10); }
	    }
	});

	me.callParent();

	store.guaranteeRange(0, store.pageSize - 1);
    }
});

Ext.define('PVE.node.SubscriptionKeyEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	Ext.apply(me, {
	    title: gettext('Upload Subscription Key'),
	    width: 300,
	    items: {
		xtype: 'textfield',
		name: 'key',
		value: '',
		fieldLabel: gettext('Subscription Key')
	    }
	});

	me.callParent();

	me.load();
    }
});

Ext.define('PVE.node.Subscription', {
    extend: 'PVE.grid.ObjectGrid',

    alias: ['widget.pveNodeSubscription'],

    features: [ {ftype: 'selectable'}],

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	var reload = function() {
	    me.rstore.load();
	};

	var baseurl = '/nodes/' + me.nodename + '/subscription';

	var render_status = function(value) {

	    var message = me.getObjectValue('message');

	    if (message) {
		return value + ": " + message;
	    }
	    return value;
	};

	var rows = {
	    productname: {
		header: gettext('Type')
	    },
	    key: {
		header: gettext('Subscription Key')
	    },
	    status: {
		header: gettext('Status'),
		renderer: render_status
	    },
	    message: {
		visible: false
	    },
	    serverid: {
		header: gettext('Server ID')
	    },
	    sockets: {
		header: 'Sockets'
	    },
	    checktime: {
		header: 'Last checked',
		renderer: PVE.Utils.render_timestamp
	    }	    
	};

	Ext.applyIf(me, {
	    url: '/api2/json' + baseurl,
	    cwidth1: 170,
	    tbar: [ 
		{
		    text: gettext('Upload Subscription Key'),
		    handler: function() {
			var win = Ext.create('PVE.node.SubscriptionKeyEdit', {
			    url: '/api2/extjs/' + baseurl 
			});
			win.show();
			win.on('destroy', reload);
		    }
		},
		{
		    text: gettext('Check'),
		    handler: function() {
			PVE.Utils.API2Request({
			    params: { force: 1 },
			    url: baseurl,
			    method: 'POST',
			    waitMsgTarget: me,
			    failure: function(response, opts) {
				Ext.Msg.alert('Error', response.htmlStatus);
			    },
			    callback: reload
			});
		    }
		}
	    ],
	    rows: rows,
	    listeners: {
		show: reload
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('pve-services', {
	extend: 'Ext.data.Model',
	fields: [ 'service', 'name', 'desc', 'state' ],
	idProperty: 'service'
    });

});
Ext.define('PVE.node.APT', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveNodeAPT'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var store = Ext.create('Ext.data.Store', {
	    model: 'apt-pkglist',
	    groupField: 'Origin',
	    proxy: {
                type: 'pve',
                url: "/api2/json/nodes/" + nodename + "/apt/update"
	    },
	    sorters: [
		{
		    property : 'Package',
		    direction: 'ASC'
		}
	    ]
	});

	var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{[ "Origin: " + values.name ]} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
	    enableGroupingMenu: false
	});

	var rowBodyFeature = Ext.create('Ext.grid.feature.RowBody', {
            getAdditionalData: function (data, rowIndex, record, orig) {
                var headerCt = this.view.headerCt;
                var colspan = headerCt.getColumnCount();
                // Usually you would style the my-body-class in CSS file
                return {
                    rowBody: '<div style="padding: 1em">' + data.Description + '</div>',
                    rowBodyColspan: colspan
                };
	    }
	});

	var reload = function() {
	    store.load();
	};

	me.loadCount = 1; // avoid duplicate load mask
	PVE.Utils.monStoreErrors(me, store);

	var apt_command = function(cmd){
	    PVE.Utils.API2Request({
		url: "/nodes/" + nodename + "/apt/" + cmd,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		},
		success: function(response, opts) {
		    var upid = response.result.data;

		    var win = Ext.create('PVE.window.TaskViewer', { 
			upid: upid
		    });
		    win.show();
		    me.mon(win, 'close', reload);
		}
	    });
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var update_btn = new Ext.Button({
	    text: gettext('Refresh'),
	    handler: function(){
		PVE.Utils.checked_command(function() { apt_command('update'); });
	    }
	});

	var upgrade_btn = new PVE.button.Button({
	    text: gettext('Upgrade'),
	    disabled: !(PVE.UserName && PVE.UserName === 'root@pam'),
	    handler: function() {
		PVE.Utils.checked_command(function() {
		    var url = Ext.urlEncode({
			console: 'upgrade',
			node: nodename
		    });
		    var nw = window.open("?" + url, '_blank', 
					 "innerWidth=745,innerheight=427");
		    nw.focus();
		});
	    }
	}); 


	var show_changelog = function(rec) {
	    if (!rec || !rec.data || !(rec.data.ChangeLogUrl && rec.data.Package)) {
		return;
	    }

	    var view = Ext.createWidget('component', {
		autoScroll: true,
		style: {
		    'background-color': 'white',
		    'white-space': 'pre',
		    'font-family': 'monospace',
		    padding: '5px'
		}
	    });

	    var win = Ext.create('Ext.window.Window', {
		title: gettext('Changelog') + ": " + rec.data.Package,
		width: 800,
		height: 400,
		layout: 'fit',
		modal: true,
		items: [ view ] 
	    });

	    PVE.Utils.API2Request({
		waitMsgTarget: me,
		url: "/nodes/" + nodename + "/apt/changelog",
		params: {
		    name: rec.data.Package,
		    version: rec.data.Version
		},
		method: 'GET',
		failure: function(response, opts) {
		    win.close();
		    Ext.Msg.alert('Error', response.htmlStatus);
		},
		success: function(response, opts) {
		    win.show();
		    view.update(Ext.htmlEncode(response.result.data));
		}
	    });

	};

	var changelog_btn = new PVE.button.Button({
	    text: gettext('Changelog'),
	    selModel: sm,
	    disabled: true,
	    enableFn: function(rec) {
		if (!rec || !rec.data || !(rec.data.ChangeLogUrl && rec.data.Package)) {
		    return false;
		}
		return true;
	    },	    
	    handler: function(b, e, rec) {
		show_changelog(rec);
	    }
	});

	Ext.apply(me, {
	    store: store,
	    stateful: false,
	    selModel: sm,
            viewConfig: {
		stripeRows: false,
		emptyText: '<div style="display:table; width:100%; height:100%;"><div style="display:table-cell; vertical-align: middle; text-align:center;"><b>' + gettext('No updates available.') + '</div></div>'
	    },
	    tbar: [ update_btn, upgrade_btn, changelog_btn ],
	    features: [ groupingFeature, rowBodyFeature ],
	    columns: [
		{
		    header: gettext('Package'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'Package'
		},
		{
		    text: gettext('Version'),
		    columns: [
			{
			    header: gettext('current'),
			    width: 100,
			    sortable: false,
			    dataIndex: 'OldVersion'
			},
			{
			    header: gettext('new'),
			    width: 100,
			    sortable: false,
			    dataIndex: 'Version'
			}
		    ]
		},
		{
		    header: gettext('Description'),
		    sortable: false,
		    dataIndex: 'Title',
		    flex: 1
		}
	    ],
	    listeners: { 
		show: reload,
		itemdblclick: function(v, rec) {
		    show_changelog(rec);
		}
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('apt-pkglist', {
	extend: 'Ext.data.Model',
	fields: [ 'Package', 'Title', 'Description', 'Section', 'Arch',
		  'Priority', 'Version', 'OldVersion', 'ChangeLogUrl', 'Origin' ],
	idProperty: 'Package'
    });

});
Ext.define('PVE.node.Config', {
    extend: 'PVE.panel.Config',
    alias: 'widget.PVE.node.Config',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	me.statusStore = Ext.create('PVE.data.ObjectStore', {
	    url: "/api2/json/nodes/" + nodename + "/status",
	    interval: 1000
	});

	var node_command = function(cmd) {
	    PVE.Utils.API2Request({
		params: { command: cmd },
		url: '/nodes/' + nodename + '/status',
		method: 'POST',
		waitMsgTarget: me,
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	var restartBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Restart'),
	    disabled: !caps.nodes['Sys.PowerMgmt'],
	    confirmMsg: Ext.String.format(gettext("Do you really want to restart node {0}?"), nodename),
	    handler: function() { 
		node_command('reboot');
	    }
	});

	var shutdownBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Shutdown'),
	    disabled: !caps.nodes['Sys.PowerMgmt'],
	    confirmMsg: Ext.String.format(gettext("Do you really want to shutdown node {0}?"), nodename),
	    handler: function() { 
		node_command('shutdown');
	    }
	});

	var shellBtn = Ext.create('Ext.Button', { 
	    text: gettext('Shell'),
	    disabled: !caps.nodes['Sys.Console'],
	    handler: function() {
		var url = Ext.urlEncode({
		    console: 'shell',
		    node: nodename
		});
		var nw = window.open("?" + url, '_blank', 
				     "innerWidth=745,innerheight=427");
		nw.focus();
	    }
	}); 

	me.items = [];

	Ext.apply(me, {
	    title: gettext('Node') + " '" + nodename + "'",
	    hstateid: 'nodetab',
	    defaults: { statusStore: me.statusStore },
	    tbar: [ restartBtn, shutdownBtn, shellBtn ]
	});

	if (caps.nodes['Sys.Audit']) {
	    me.items.push([
		{
		    title: gettext('Summary'),
		    itemId: 'summary',
		    xtype: 'pveNodeSummary'
		},
		{
		    title: gettext('Services'),
		    itemId: 'services',
		    xtype: 'pveNodeServiceView'
		},
		{
		    title: gettext('Network'),
		    itemId: 'network',
		    xtype: 'pveNodeNetworkView'
		},
		{
		    title: 'DNS',
		    itemId: 'dns',
		    xtype: 'pveNodeDNSView'
		},
		{
		    title: gettext('Time'),
		    itemId: 'time',
		    xtype: 'pveNodeTimeView'
		}
	    ]);
	}

	if (caps.nodes['Sys.Syslog']) {
	    me.items.push([
		{
		    title: 'Syslog',
		    itemId: 'syslog',
		    xtype: 'pveLogView',
		    url: "/api2/extjs/nodes/" + nodename + "/syslog"
		}
	    ]);
	    me.items.push([
		{
		    title: 'Bootlog',
		    itemId: 'bootlog',
		    xtype: 'pveLogView',
		    url: "/api2/extjs/nodes/" + nodename + "/bootlog"
		}
	    ]);
	}

	me.items.push([
	    {
		title: 'Task History',
		itemId: 'tasks',
		xtype: 'pveNodeTasks'
	    }
	]);


	if (caps.nodes['Sys.Audit']) {
	    me.items.push([
		{
		    title: 'UBC',
		    itemId: 'ubc',
		    xtype: 'pveNodeBCFailCnt'
		}
	    ]);
	}
	
	me.items.push([
	    {
		title: 'Subscription',
		itemId: 'support',
		xtype: 'pveNodeSubscription',
		nodename: nodename
	    }
	]);

	if (caps.nodes['Sys.Console']) {
	    me.items.push([{
		title: gettext('Updates'),
		itemId: 'apt',
		xtype: 'pveNodeAPT',
		nodename: nodename
	    }]);
	}

	me.callParent();

	me.statusStore.on('load', function(s, records, success) {
	    var uptimerec = s.data.get('uptime');
	    var powermgmt = uptimerec ? uptimerec.data.value : false;
	    if (!caps.nodes['Sys.PowerMgmt']) {
		powermgmt = false;
	    }
	    restartBtn.setDisabled(!powermgmt);
	    shutdownBtn.setDisabled(!powermgmt);
	    shellBtn.setDisabled(!powermgmt);
	});

	me.on('afterrender', function() {
	    me.statusStore.startUpdate();
	});

	me.on('destroy', function() {
	    me.statusStore.stopUpdate();
	});
    }
});
Ext.define('PVE.qemu.StatusView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveQemuStatusView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var render_cpu = function(value, metaData, record, rowIndex, colIndex, store) {
	    if (!me.getObjectValue('uptime')) {
		return '-';
	    }

	    var maxcpu = me.getObjectValue('cpus', 1);

	    if (!(Ext.isNumeric(value) && Ext.isNumeric(maxcpu) && (maxcpu >= 1))) {
		return '-';
	    }

	    var per = (value * 100);

	    return per.toFixed(1) + '% of ' + maxcpu.toString() + (maxcpu > 1 ? 'CPUs' : 'CPU');
	};

	var render_mem = function(value, metaData, record, rowIndex, colIndex, store) {
	    var maxmem = me.getObjectValue('maxmem', 0);
	    var per = (value / maxmem)*100;
	    var text = "<div>Total: " + PVE.Utils.format_size(maxmem) + "</div>" + 
		"<div>Used: " + PVE.Utils.format_size(value) + "</div>";
	    return text;
	};

	var rows = {
	    name: { header: gettext('Name'), defaultValue: 'no name specified' },
	    qmpstatus: { header: gettext('Status'), defaultValue: 'unknown' },
	    cpu: { header: 'CPU usage', required: true,  renderer: render_cpu },
	    cpus: { visible: false },
	    mem: { header: 'Memory usage', required: true,  renderer: render_mem },
	    maxmem: { visible: false },
	    uptime: { header: gettext('Uptime'), required: true, renderer: PVE.Utils.render_uptime },
	    ha: { header: 'Managed by HA', required: true, renderer: PVE.Utils.format_boolean }
	};

	Ext.applyIf(me, {
	    cwidth1: 150,
	    height: 166,
	    rows: rows
	});

	me.callParent();
    }
});
Ext.define('PVE.window.Migrate', {
    extend: 'Ext.window.Window',

    resizable: false,

    migrate: function(target, online) {
	var me = this;
	PVE.Utils.API2Request({
	    params: { target: target, online: online },
	    url: '/nodes/' + me.nodename + '/' + me.vmtype + '/' + me.vmid + "/migrate",
	    waitMsgTarget: me,
	    method: 'POST',
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, options) {
		var upid = response.result.data;

		var win = Ext.create('PVE.window.TaskViewer', { 
		    upid: upid
		});
		win.show();
		me.close();
	    }
	});
    },

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	if (!me.vmtype) {
	    throw "no VM type specified";
	}

	var running = false;
	var vmrec = PVE.data.ResourceStore.findRecord('vmid', me.vmid,
						      0, false, false, true);
	if (vmrec && vmrec.data && vmrec.data.running) {
	    running = true;
	}

	me.formPanel = Ext.create('Ext.form.Panel', {
	    bodyPadding: 10,
	    border: false,
	    fieldDefaults: {
		labelWidth: 100,
		anchor: '100%'
	    },
	    items: [
		{
		    xtype: 'PVE.form.NodeSelector',
		    name: 'target',
		    fieldLabel: 'Target node',
		    allowBlank: false,
		    onlineValidator: true
		},
		{
		    xtype: 'pvecheckbox',
		    name: 'online',
		    uncheckedValue: 0,
		    defaultValue: 0,
		    checked: running,
		    fieldLabel: 'Online'
		}
	    ]
	});

	var form = me.formPanel.getForm();

	var submitBtn = Ext.create('Ext.Button', {
	    text: 'Migrate',
	    handler: function() {
		var values = form.getValues();
		me.migrate(values.target, values.online);
	    }
	});

	Ext.apply(me, {
	    title: "Migrate VM " + me.vmid,
	    width: 350,
	    modal: true,
	    layout: 'auto',
	    border: false,
	    items: [ me.formPanel ],
	    buttons: [ submitBtn ]
	});

	me.callParent();
    }
});
Ext.define('PVE.qemu.Monitor', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.pveQemuMonitor',

    maxLines: 500,

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var lines = [];

	var textbox = Ext.createWidget('panel', {
	    region: 'center',
	    xtype: 'panel',
	    autoScroll: true,
	    border: true,
	    margins: '5 5 5 5',
	    bodyStyle: 'font-family: monospace;'
	});

	var scrollToEnd = function() {
	    var el = textbox.getTargetEl();
	    var dom = Ext.getDom(el);

	    var clientHeight = dom.clientHeight;
	    // BrowserBug: clientHeight reports 0 in IE9 StrictMode
            // Instead we are using offsetHeight and hardcoding borders
            if (Ext.isIE9 && Ext.isStrict) {
		clientHeight = dom.offsetHeight + 2;
            }
	    dom.scrollTop = dom.scrollHeight - clientHeight;
	};

	var refresh = function() {
	    textbox.update('<pre>' + lines.join('\n') + '</pre>');
	    scrollToEnd();
	};

	var addLine = function(line) {
	    lines.push(line);
	    if (lines.length > me.maxLines) {
		lines.shift();
	    }
	};

	var executeCmd = function(cmd) {
	    addLine("# " + Ext.htmlEncode(cmd));
	    refresh();
	    PVE.Utils.API2Request({
		params: { command: cmd },
		url: '/nodes/' + nodename + '/qemu/' + vmid + "/monitor",
		method: 'POST',
		waitMsgTarget: me,
		success: function(response, opts) {
		    var res = response.result.data; 
		    Ext.Array.each(res.split('\n'), function(line) {
			addLine(Ext.htmlEncode(line));
		    });
		    refresh();
		},
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	Ext.apply(me, {
	    layout: { type: 'border' },
	    border: false,
	    items: [
		textbox,
		{
		    region: 'south',
		    margins:'0 5 5 5',
		    border: false,
		    xtype: 'textfield',
		    name: 'cmd',
		    value: '',
		    fieldStyle: 'font-family: monospace;',
		    allowBlank: true,
		    listeners: {
			afterrender: function(f) {
			    f.focus(false);
			    addLine("Type 'help' for help.");
			    refresh();
			},
			specialkey: function(f, e) {
			    if (e.getKey() === e.ENTER) {
				var cmd = f.getValue();
				f.setValue('');
				executeCmd(cmd);
			    }
			}
		    }
		}
	    ],
	    listeners: {
		show: function() {
		    var field = me.query('textfield[name="cmd"]')[0];
		    field.focus(false, true);
		}
	    }
	});		

	me.callParent();
    }
});
Ext.define('PVE.qemu.Summary', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pveQemuSummary',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	if (!me.workspace) {
	    throw "no workspace specified";
	}

	if (!me.statusStore) {
	    throw "no status storage specified";
	}

	var rstore = me.statusStore;

	var statusview = Ext.create('PVE.qemu.StatusView', {
	    title: 'Status',
	    pveSelNode: me.pveSelNode,
	    width: 400,
	    rstore: rstore
	});

	var rrdurl = "/api2/png/nodes/" + nodename + "/qemu/" + vmid + "/rrd";

	var notesview = Ext.create('PVE.panel.NotesView', {
	    pveSelNode: me.pveSelNode,
	    flex: 1
	});

	Ext.apply(me, {
	    tbar: [ '->', { xtype: 'pveRRDTypeSelector' } ],
	    autoScroll: true,
	    bodyStyle: 'padding:10px',
	    defaults: {
		style: 'padding-top:10px',
		width: 800
	    },		
	    items: [
		{
		    style: 'padding-top:0px',
		    layout: {
			type: 'hbox',
			align: 'stretchmax'
		    },
		    border: false,
		    items: [ statusview, notesview ]
		},
		{
		    xtype: 'pveRRDView',
		    title: "CPU usage %",
		    pveSelNode: me.pveSelNode,
		    datasource: 'cpu',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Memory usage",
		    pveSelNode: me.pveSelNode,
		    datasource: 'mem,maxmem',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Network traffic",
		    pveSelNode: me.pveSelNode,
		    datasource: 'netin,netout',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Disk IO",
		    pveSelNode: me.pveSelNode,
		    datasource: 'diskread,diskwrite',
		    rrdurl: rrdurl
		}
	    ]
	});

	me.on('show', function() {
	    notesview.load();
	});

	me.callParent();
    }
});
Ext.define('PVE.qemu.OSTypeInputPanel', {
    extend: 'PVE.panel.InputPanel',
    alias: 'widget.PVE.qemu.OSTypeInputPanel',

    initComponent : function() {
	var me = this;

	me.column1 = [
	    {
		xtype: 'component', 
		html: 'Microsoft Windows', 
		cls:'x-form-check-group-label'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'win8'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'win7'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'w2k8'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'wxp'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'w2k'
	    }
	];

	me.column2 = [
	    {
		xtype: 'component', 
		html: 'Linux/Other', 
		cls:'x-form-check-group-label'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'l26'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'l24'
	    },
	    {
		xtype: 'radiofield',
		name: 'ostype',
		inputValue: 'other'
	    }
	];

	Ext.Array.each(me.column1, function(def) {
	    if (def.inputValue) {
		def.boxLabel = PVE.Utils.render_kvm_ostype(def.inputValue);
	    }
	});
	Ext.Array.each(me.column2, function(def) {
	    if (def.inputValue) {
		def.boxLabel = PVE.Utils.render_kvm_ostype(def.inputValue);
	    }
	});

	Ext.apply(me, {
	    useFieldContainer: {
		xtype: 'radiogroup',
		allowBlank: false
	    }
	});

	me.callParent();
    }   
});

Ext.define('PVE.qemu.OSTypeEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
	
	Ext.apply(me, {
	    subject: 'OS Type',
	    items: Ext.create('PVE.qemu.OSTypeInputPanel')
	});

	me.callParent();

	me.load({
	    success: function(response, options) {
		var value = response.result.data.ostype || 'other';
		me.setValues({ ostype: value});
	    }
	});
    }
});
Ext.define('PVE.qemu.ProcessorInputPanel', {
    extend: 'PVE.panel.InputPanel',
    alias: 'widget.PVE.qemu.ProcessorInputPanel',

    initComponent : function() {
	var me = this;

	me.column1 = [
	    {
		xtype: 'numberfield',
		name: 'sockets',
		minValue: 1,
		maxValue: 4,
		value: '1',
		fieldLabel: 'Sockets',
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			var sockets = me.down('field[name=sockets]').getValue();
			var cores = me.down('field[name=cores]').getValue();
			me.down('field[name=totalcores]').setValue(sockets*cores);
		    }
		}
	    },
	    {
		xtype: 'numberfield',
		name: 'cores',
		minValue: 1,
		maxValue: 32,
		value: '1',
		fieldLabel: 'Cores',
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			var sockets = me.down('field[name=sockets]').getValue();
			var cores = me.down('field[name=cores]').getValue();
			me.down('field[name=totalcores]').setValue(sockets*cores);
		    }
		}
	    }
	];


	me.column2 = [
	    {
		xtype: 'CPUModelSelector',
		name: 'cpu',
		value: '',
		fieldLabel: 'CPU type'
	    },
	    {
		xtype: 'displayfield',
		fieldLabel: 'Total cores',
		name: 'totalcores',
		value: '1'
	    }

	];

	me.callParent();
    }
});

Ext.define('PVE.qemu.ProcessorEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
	
	Ext.apply(me, {
	    subject: gettext('Processors'),
	    items: Ext.create('PVE.qemu.ProcessorInputPanel')
	});

	me.callParent();

	me.load();
    }
});Ext.define('PVE.qemu.BootOrderPanel', {
    extend: 'PVE.panel.InputPanel',

    vmconfig: {}, // store loaded vm config

    bootdisk: undefined,
    curSel1: '',
    curSel2: '',
    curSel3: '',

    onGetValues: function(values) {
	var me = this;

	var order = '';

	if (me.curSel1) {
	    order = order + me.curSel1;
	}
	if (me.curSel2) {
	    order = order + me.curSel2;
	}
	if (me.curSel3) {
	    order = order + me.curSel3;
	}

	var res = { boot: order };
	if (me.bootdisk && (me.curSel1 === 'c' || me.curSel2 === 'c' || me.curSel3 === 'c') ) {
	    res.bootdisk =  me.bootdisk;
	} else {
	    res['delete'] = 'bootdisk';
	} 

	return res;
    },

    setVMConfig: function(vmconfig) {
	var me = this;

	me.vmconfig = vmconfig;

	var order = me.vmconfig.boot || 'cdn';
	me.bootdisk = me.vmconfig.bootdisk;
	if (!me.vmconfig[me.bootdisk]) {
	    me.bootdisk = undefined;
	}
	me.curSel1 = order.substring(0, 1) || '';
	me.curSel2 = order.substring(1, 2) || '';
	me.curSel3 = order.substring(2, 3) || '';

	me.compute_sel1();

	me.kv1.resetOriginalValue();
	me.kv2.resetOriginalValue();
	me.kv3.resetOriginalValue();
    },

    genList: function(includeNone, sel1, sel2) {
	var me = this;
	var list = [];

	if (sel1 !== 'c' && (sel2 !== 'c')) {
	    Ext.Object.each(me.vmconfig, function(key, value) {
		if ((/^(ide|sata|scsi|virtio)\d+$/).test(key) &&
		    !(/media=cdrom/).test(value)) {
		    list.push([key, "Disk '" + key + "'"]);
		}
	    });
	}

	if (sel1 !== 'd' && (sel2 !== 'd')) {
	    list.push(['d', 'CD-ROM']);
	}
	if (sel1 !== 'n' && (sel2 !== 'n')) {
	    list.push(['n', gettext('Network')]);
	}
	//if (sel1 !== 'a' && (sel2 !== 'a')) {
	//    list.push(['a', 'Floppy']);
	//}
	
	if (includeNone) {
	    list.push(['', 'none']);
	}

	return list;
    },

    compute_sel3: function() {
	var me = this;
	var list = me.genList(true, me.curSel1, me.curSel2);
	me.kv3.store.loadData(list);
	me.kv3.setValue((me.curSel3 === 'c') ? me.bootdisk : me.curSel3);
    },

    compute_sel2: function() {
	var me = this;
	var list = me.genList(true, me.curSel1);
	me.kv2.store.loadData(list);
	me.kv2.setValue((me.curSel2 === 'c') ? me.bootdisk : me.curSel2);
	me.compute_sel3();
    },

    compute_sel1: function() {
	var me = this;
	var list = me.genList(false);
	me.kv1.store.loadData(list);
	me.kv1.setValue((me.curSel1 === 'c') ? me.bootdisk : me.curSel1);
	me.compute_sel2();
    },

    initComponent : function() {
	var me = this;

	me.kv1 = Ext.create('PVE.form.KVComboBox', {
	    fieldLabel: gettext('Boot device') + " 1",
	    labelWidth: 120,
	    name: 'bd1',
	    allowBlank: false,
	    data: []
	});

	me.kv2 = Ext.create('PVE.form.KVComboBox', {
	    fieldLabel: gettext('Boot device') + " 2",
	    labelWidth: 120,
	    name: 'bd2',
	    allowBlank: false,
	    data: []
	});

	me.kv3 = Ext.create('PVE.form.KVComboBox', {
	    fieldLabel: gettext('Boot device') + " 3",
	    labelWidth: 120,
	    name: 'bd3',
	    allowBlank: false,
	    data: []
	});

	me.mon(me.kv1, 'change', function(t, value) {
	    if ((/^(ide|sata|scsi|virtio)\d+$/).test(value)) {
		me.curSel1 = 'c';
		me.bootdisk = value;
	    } else {
		me.curSel1 = value;
	    }
	    me.compute_sel2();
	});

	me.mon(me.kv2, 'change', function(t, value) {
	    if ((/^(ide|sata|scsi|virtio)\d+$/).test(value)) {
		me.curSel2 = 'c';
		me.bootdisk = value;
	    } else {
		me.curSel2 = value;
	    }
	    me.compute_sel3();
	});

	me.mon(me.kv3, 'change', function(t, value) {
	    if ((/^(ide|sata|scsi|virtio)\d+$/).test(value)) {
		me.curSel3 = 'c';
		me.bootdisk = value;
	    } else {
		me.curSel3 = value;
	    }
	});

	Ext.apply(me, {
	    items: [ me.kv1, me.kv2, me.kv3 ]	
	});
	
	me.callParent();
    }
});

Ext.define('PVE.qemu.BootOrderEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
	
	var ipanel = Ext.create('PVE.qemu.BootOrderPanel', {});

	me.items = [ ipanel ];

	me.subject = gettext('Boot order');

	me.callParent();
	
	me.load({
	    success: function(response, options) {
		ipanel.setVMConfig(response.result.data);
	    }
	});
    }
});
Ext.define('PVE.qemu.MemoryInputPanel', {
    extend: 'PVE.panel.InputPanel',
    alias: 'widget.PVE.qemu.MemoryInputPanel',

    insideWizard: false,

    onGetValues: function(values) {
	var me = this;

	var res;

	if (values.memoryType === 'fixed') {
	    res = { memory: values.memory };
	    res['delete'] = "balloon,shares";
	} else {
	    res = { 
		memory: values.maxmemory,
		balloon: values.balloon
	    };
	    if (Ext.isDefined(values.shares) && (values.shares !== "")) {
		res.shares = values.shares;
	    } else {
		res['delete'] = "shares";
	    }
	}

	return res;
    },

    initComponent : function() {
	var me = this;

	var labelWidth = 160;

	var items = [
	    {
		xtype: 'radiofield',
		name: 'memoryType',
		inputValue: 'fixed',
		boxLabel: gettext('Use fixed size memory'),
		checked: true,
		listeners: {
		    change: function(f, value) {
			if (!me.rendered) {
			    return;
			}
			me.down('field[name=memory]').setDisabled(!value);
			me.down('field[name=maxmemory]').setDisabled(value);
			me.down('field[name=balloon]').setDisabled(value);
			me.down('field[name=shares]').setDisabled(value);
		    }
		}
	    },
	    {
		xtype: 'numberfield',
		name: 'memory',
		minValue: 32,
		maxValue: 512*1024,
		value: '512',
		step: 32,
		fieldLabel: gettext('Memory') + ' (MB)',
		labelAlign: 'right',
		labelWidth: labelWidth,
		allowBlank: false
	    },
	    {
		xtype: 'radiofield',
		name: 'memoryType',
		inputValue: 'dynamic',
		boxLabel: gettext('Automatically allocate memory within this range'),
		listeners: {
		    change: function(f, value) {
			if (!me.rendered) {
			    return;
			}
		    }
		}
	    },
	    {
		xtype: 'numberfield',
		name: 'maxmemory',
		disabled: true,
		minValue: 32,
		maxValue: 512*1024,
		value: '1024',
		step: 32,
		fieldLabel: gettext('Maximum memory') + ' (MB)',
		labelAlign: 'right',
		labelWidth: labelWidth,
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			var bf = me.down('field[name=balloon]');
			var balloon = bf.getValue();
			if (balloon > value) {
			    bf.setValue(value);
			}
			bf.setMaxValue(value);
		    }
		}
	    },
	    {
		xtype: 'numberfield',
		name: 'balloon',
		disabled: true,
		minValue: 0,
		maxValue: 512*1024,
		value: '512',
		step: 32,
		fieldLabel: gettext('Minimum memory') + ' (MB)',
		labelAlign: 'right',
		labelWidth: labelWidth,
		allowBlank: false
	    },
	    {
		xtype: 'numberfield',
		name: 'shares',
		disabled: true,
		minValue: 0,
		maxValue: 50000,
		value: '',
		step: 10,
		fieldLabel: gettext('Shares'),
		labelAlign: 'right',
		labelWidth: labelWidth,
		allowBlank: true,
		emptyText: PVE.Utils.defaultText + ' (1000)',
		submitEmptyText: false
	    }
	];

	if (me.insideWizard) {
	    me.column1 = items;
	} else {
	    me.items = items;
	}

	me.callParent();
    }
});

Ext.define('PVE.qemu.MemoryEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
	
	Ext.apply(me, {
	    subject: gettext('Memory'),
	    items: [ Ext.create('PVE.qemu.MemoryInputPanel') ],
	    // uncomment the following to use the async configiguration API
	    // backgroundDelay: 5, 
	    width: 400
	});

	me.callParent();

	me.load({
	    success: function(response, options) {
		var data = response.result.data;

		var values = {
		    memory: data.memory,
		    maxmemory: data.memory,
		    balloon: data.balloon,
		    shares: data.shares,
		    memoryType: data.balloon ? 'dynamic' : 'fixed'
		};

		me.setValues(values);
	    }
	});
    }
});Ext.define('PVE.qemu.NetworkInputPanel', {
    extend: 'PVE.panel.InputPanel',
    alias: 'widget.PVE.qemu.NetworkInputPanel',

    insideWizard: false,

    onGetValues: function(values) {
	var me = this;

	me.network.model = values.model;
	if (values.networkmode === 'none') {
	    return {};
	} else if (values.networkmode === 'bridge') {
	    me.network.bridge = values.bridge;
	    me.network.tag = values.tag;
	} else {
	    me.network.bridge = undefined;
	}
	me.network.macaddr = values.macaddr;

	if (values.rate) {
	    me.network.rate = values.rate;
	} else {
	    delete me.network.rate;
	}

	var params = {};

	params[me.confid] = PVE.Parser.printQemuNetwork(me.network);

	return params;
    },

    setNetwork: function(confid, data) {
	var me = this;

	me.confid = confid;

	if (data) {
	    data.networkmode = data.bridge ? 'bridge' : 'nat';
	} else {
	    data = {};
	    data.networkmode = 'bridge';
	}
	me.network = data;
	
	me.setValues(me.network);
    },

    setNodename: function(nodename) {
	var me = this;

	me.bridgesel.setNodename(nodename);
    },

    initComponent : function() {
	var me = this;

	me.network = {};
	me.confid = 'net0';

	me.bridgesel = Ext.create('PVE.form.BridgeSelector', {
	    name: 'bridge',
	    fieldLabel: 'Bridge',
	    nodename: me.nodename,
	    labelAlign: 'right',
	    autoSelect: true,
	    allowBlank: false
	});

	me.column1 = [
	    {
		xtype: 'radiofield',
		name: 'networkmode',
		height: 22, // hack: set same height as text fields
		inputValue: 'bridge',
		boxLabel: 'Bridged mode',
		checked: true,
		listeners: {
		    change: function(f, value) {
			if (!me.rendered) {
			    return;
			}
			me.down('field[name=bridge]').setDisabled(!value);
			me.down('field[name=bridge]').validate();
			me.down('field[name=tag]').setDisabled(!value);
		    }
		}
	    },
	    me.bridgesel,
	    {
		xtype: 'numberfield',
		name: 'tag',
		minValue: 1,
		maxValue: 4094,
		value: '',
		emptyText: 'no VLAN',
		fieldLabel: 'VLAN Tag',
		labelAlign: 'right',
		allowBlank: true
	    },
	    {
		xtype: 'radiofield',
		name: 'networkmode',
		height: 22, // hack: set same height as text fields
		inputValue: 'nat',
		boxLabel: 'NAT mode'
	    }
	];

	if (me.insideWizard) {
	    me.column1.push({
		xtype: 'radiofield',
		name: 'networkmode',
		height: 22, // hack: set same height as text fields
		inputValue: 'none',
		boxLabel: 'No network device'
	    });
	}

	me.column2 = [
	    {
		xtype: 'PVE.form.NetworkCardSelector',
		name: 'model',
		fieldLabel: 'Model',
		value: 'e1000',
		allowBlank: false
	    },
	    {
		xtype: 'textfield',
		name: 'macaddr',
		fieldLabel: 'MAC address',
		vtype: 'MacAddress',
		allowBlank: true,
		emptyText: 'auto'
	    },
	    {
		xtype: 'numberfield',
		name: 'rate',
		fieldLabel: 'Rate limit (MB/s)',
		minValue: 0,
		maxValue: 10*1024,
		value: '',
		emptyText: 'unlimited',
		allowBlank: true
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.qemu.NetworkEdit', {
    extend: 'PVE.window.Edit',

    isAdd: true,

    initComponent : function() {
	/*jslint confusion: true */

	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) { 
	    throw "no node name specified";	    
	}

	me.create = me.confid ? false : true;

	var ipanel = Ext.create('PVE.qemu.NetworkInputPanel', {
	    confid: me.confid,
	    nodename: nodename
	});

	Ext.applyIf(me, {
	    subject: gettext('Network Device'),
	    items: ipanel
	});

	me.callParent();

	me.load({
	    success: function(response, options) {
		var i, confid;
		me.vmconfig = response.result.data;
		if (!me.create) {
		    var value = me.vmconfig[me.confid];
		    var network = PVE.Parser.parseQemuNetwork(me.confid, value);
		    if (!network) {
			Ext.Msg.alert('Error', 'Unable to parse network options');
			me.close();
			return;
		    }
		    ipanel.setNetwork(me.confid, network);
		} else {
		    for (i = 0; i < 100; i++) {
			confid = 'net' + i.toString();
			if (!Ext.isDefined(me.vmconfig[confid])) {
			    me.confid = confid;
			    break;
			}
		    }
		    ipanel.setNetwork(me.confid);		    
		}
	    }
	});
    }
});
// fixme: howto avoid jslint type confusion?
/*jslint confusion: true */
Ext.define('PVE.qemu.CDInputPanel', {
    extend: 'PVE.panel.InputPanel',
    alias: 'widget.PVE.qemu.CDInputPanel',

    insideWizard: false,

    onGetValues: function(values) {
	var me = this;

	var confid = me.confid || (values.controller + values.deviceid);
	
	me.drive.media = 'cdrom';
	if (values.mediaType === 'iso') {
	    me.drive.file = values.cdimage;
	} else if (values.mediaType === 'cdrom') {
	    me.drive.file = 'cdrom';
	} else {
	    me.drive.file = 'none';
	}

	var params = {};
		
	params[confid] = PVE.Parser.printQemuDrive(me.drive);
	
	return params;	
    },

    setVMConfig: function(vmconfig) {
	var me = this;

	if (me.bussel) {
	    me.bussel.setVMConfig(vmconfig, 'cdrom');
	}
    },

    setDrive: function(drive) {
	var me = this;

	var values = {};
	if (drive.file === 'cdrom') {
	    values.mediaType = 'cdrom';
	} else if (drive.file === 'none') {
	    values.mediaType = 'none';
	} else {
	    values.mediaType = 'iso';
	    var match = drive.file.match(/^([^:]+):/);
	    if (match) {
		values.cdstorage = match[1];
		values.cdimage = drive.file;
	    }
	}

	me.drive = drive;

	me.setValues(values);
    },

    setNodename: function(nodename) {
	var me = this;

	me.cdstoragesel.setNodename(nodename);
	me.cdfilesel.setStorage(undefined, nodename);
    },

    initComponent : function() {
	var me = this;

	me.drive = {};

	var items = [];

	if (!me.confid) {
	    me.bussel = Ext.createWidget('PVE.form.ControllerSelector', {
		noVirtIO: true
	    });
	    items.push(me.bussel);
	}

	items.push({
	    xtype: 'radiofield',
	    name: 'mediaType',
	    inputValue: 'iso',
	    boxLabel: 'Use CD/DVD disc image file (iso)',
	    checked: true,
	    listeners: {
		change: function(f, value) {
		    if (!me.rendered) {
			return;
		    }
		    me.down('field[name=cdstorage]').setDisabled(!value);
		    me.down('field[name=cdimage]').setDisabled(!value);
		    me.down('field[name=cdimage]').validate();
		}
	    }
	});

	me.cdfilesel = Ext.create('PVE.form.FileSelector', {
	    name: 'cdimage',
	    nodename: me.nodename,
	    storageContent: 'iso',
	    fieldLabel: 'ISO Image',
	    labelAlign: 'right',
	    allowBlank: false
	});
	
	me.cdstoragesel = Ext.create('PVE.form.StorageSelector', {
	    name: 'cdstorage',
	    nodename: me.nodename,
	    fieldLabel: gettext('Storage'),
	    labelAlign: 'right',
	    storageContent: 'iso',
	    allowBlank: false,
	    autoSelect: me.insideWizard,
	    listeners: {
		change: function(f, value) {
		    me.cdfilesel.setStorage(value);
		}
	    }
	});

	items.push(me.cdstoragesel);
	items.push(me.cdfilesel);

	items.push({
	    xtype: 'radiofield',
	    name: 'mediaType',
	    inputValue: 'cdrom',
	    boxLabel: 'Use physical CD/DVD Drive'
	});

	items.push({
	    xtype: 'radiofield',
	    name: 'mediaType',
	    inputValue: 'none',
	    boxLabel: 'Do not use any media'
	});

	if (me.insideWizard) {
	    me.column1 = items;
	} else {
	    me.items = items;
	}

	me.callParent();
    }
});

Ext.define('PVE.qemu.CDEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) { 
	    throw "no node name specified";	    
	}

	me.create = me.confid ? false : true;

	var ipanel = Ext.create('PVE.qemu.CDInputPanel', {
	    confid: me.confid,
	    nodename: nodename
	});

	Ext.applyIf(me, {
	    subject: 'CD/DVD Drive',
	    items: [ ipanel ]
	});

	me.callParent();
	
	me.load({
	    success:  function(response, options) {
		ipanel.setVMConfig(response.result.data);
		if (me.confid) {
		    var value = response.result.data[me.confid];
		    var drive = PVE.Parser.parseQemuDrive(me.confid, value);
		    if (!drive) {
			Ext.Msg.alert('Error', 'Unable to parse drive options');
			me.close();
			return;
		    }
		    ipanel.setDrive(drive);
		}
	    }
	});
    }
});
// fixme: howto avoid jslint type confusion?
/*jslint confusion: true */
Ext.define('PVE.qemu.HDInputPanel', {
    extend: 'PVE.panel.InputPanel',
    alias: 'widget.PVE.qemu.HDInputPanel',

    insideWizard: false,

    unused: false, // ADD usused disk imaged

    vmconfig: {}, // used to select usused disks

    onGetValues: function(values) {
	var me = this;

	var confid = me.confid || (values.controller + values.deviceid);
	
	if (me.unused) {
	    me.drive.file = me.vmconfig[values.unusedId];
	    confid = values.controller + values.deviceid;
	} else if (me.create) {
	    if (values.hdimage) {
		me.drive.file = values.hdimage;
	    } else {
		me.drive.file = values.hdstorage + ":" + values.disksize;
	    }
	    me.drive.format = values.diskformat;
	}
	
	if (values.cache) {
	    me.drive.cache = values.cache;
	} else {
	    delete me.drive.cache;
	}

	if (values.nobackup) {
	    me.drive.backup = 'no';
	} else {
	    delete me.drive.backup;
	}

	if (values.mbps_rd) {
	    me.drive.mbps_rd = values.mbps_rd;
	} else {
	    delete me.drive.mbps_rd;
	}
	if (values.mbps_wr) {
	    me.drive.mbps_wr = values.mbps_wr;
	} else {
	    delete me.drive.mbps_wr;
	}
	if (values.iops_rd) {
	    me.drive.iops_rd = values.iops_rd;
	} else {
	    delete me.drive.iops_rd;
	}
	if (values.iops_wr) {
	    me.drive.iops_wr = values.iops_wr;
	} else {
	    delete me.drive.iops_wr;
	}

	var params = {};
		
	params[confid] = PVE.Parser.printQemuDrive(me.drive);
	
	return params;	
    },

    setVMConfig: function(vmconfig) {
	var me = this;

	me.vmconfig = vmconfig;

	if (me.bussel) {
	    me.bussel.setVMConfig(vmconfig, true);
	}
	if (me.unusedDisks) {
	    var disklist = [];	    
	    Ext.Object.each(vmconfig, function(key, value) {
		if (key.match(/^unused\d+$/)) {
		    disklist.push([key, value]);
		}
	    });
	    me.unusedDisks.store.loadData(disklist);
	    me.unusedDisks.setValue(me.confid);
	}
    },

    setDrive: function(drive) {
	var me = this;

	me.drive = drive;

	var values = {};
	var match = drive.file.match(/^([^:]+):/);
	if (match) {
	    values.hdstorage = match[1];
	}

	values.hdimage = drive.file;
	values.nobackup = (drive.backup === 'no');
	values.diskformat = drive.format || 'raw';
	values.cache = drive.cache || '';
	values.mbps_rd = drive.mbps_rd;
	values.mbps_wr = drive.mbps_wr;
	values.iops_rd = drive.iops_rd;
	values.iops_wr = drive.iops_wr;

	me.setValues(values);
    },

    setNodename: function(nodename) {
	var me = this;
	me.hdstoragesel.setNodename(nodename);
	me.hdfilesel.setStorage(undefined, nodename);
    },

    initComponent : function() {
	var me = this;

	me.drive = {};

	me.column1 = [];
	me.column2 = [];

	if (!me.confid || me.unused) {
	    me.bussel = Ext.createWidget('PVE.form.ControllerSelector', {
		vmconfig: me.insideWizard ? {ide2: 'cdrom'} : {}
	    });
	    me.column1.push(me.bussel);
	}

	if (me.unused) {
	    me.unusedDisks = Ext.create('PVE.form.KVComboBox', {
		name: 'unusedId',	
		fieldLabel: gettext('Disk image'),
		matchFieldWidth: false,
		listConfig: {
		    width: 350
		},
		data: [],
		allowBlank: false
	    });
	    me.column1.push(me.unusedDisks);
	} else if (me.create) {
	    me.formatsel = Ext.create('PVE.form.DiskFormatSelector', {
		name: 'diskformat',
		fieldLabel: gettext('Format'),
		value: 'qcow2',
		allowBlank: false
	    });

	    me.hdfilesel = Ext.create('PVE.form.FileSelector', {
		name: 'hdimage',
		nodename: me.nodename,
		storageContent: 'images',
		fieldLabel: gettext('Disk image'),
		disabled: true,
		hidden: true,
		allowBlank: false
	    });

	    me.hdsizesel = Ext.createWidget('numberfield', {
		name: 'disksize',
		minValue: 0.001,
		maxValue: 128*1024,
		decimalPrecision: 3,
		value: '32',
		fieldLabel: gettext('Disk size') + ' (GB)',
		allowBlank: false
	    });

	    me.hdstoragesel = Ext.create('PVE.form.StorageSelector', {
		name: 'hdstorage',
		nodename: me.nodename,
		fieldLabel: gettext('Storage'),
		storageContent: 'images',
		autoSelect: me.insideWizard,
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			var rec = f.store.getById(value);
			if (rec.data.type === 'iscsi') {
			    me.hdfilesel.setStorage(value);
			    me.hdfilesel.setDisabled(false);
			    me.formatsel.setValue('raw');
			    me.formatsel.setDisabled(true);
			    me.hdfilesel.setVisible(true);
			    me.hdsizesel.setDisabled(true);
			    me.hdsizesel.setVisible(false);
			} else if (rec.data.type === 'lvm' || 
				   rec.data.type === 'rbd' ||
				   rec.data.type === 'sheepdog' ||
				   rec.data.type === 'nexenta') {
			    me.hdfilesel.setDisabled(true);
			    me.hdfilesel.setVisible(false);
			    me.formatsel.setValue('raw');
			    me.formatsel.setDisabled(true);
			    me.hdsizesel.setDisabled(false);
			    me.hdsizesel.setVisible(true);
			} else {
			    me.hdfilesel.setDisabled(true);
			    me.hdfilesel.setVisible(false);
			    me.formatsel.setValue('qcow2');
			    me.formatsel.setDisabled(false);
			    me.hdsizesel.setDisabled(false);
			    me.hdsizesel.setVisible(true);
			}			
		    }
		}
	    });
	    me.column1.push(me.hdstoragesel);
	    me.column1.push(me.hdfilesel);
	    me.column1.push(me.hdsizesel);
	    me.column1.push(me.formatsel);

	} else {
	    me.column1.push({
		xtype: 'textfield',
		disabled: true,
		submitValue: false,
		fieldLabel: gettext('Disk image'),
                name: 'hdimage'
	    });
	}

	me.column1.push({
	    xtype: 'CacheTypeSelector',
	    name: 'cache',
	    value: '',
	    fieldLabel: 'Cache'
	});

	if (!me.insideWizard) {
	    me.column1.push({
		xtype: 'pvecheckbox',
		fieldLabel: gettext('No backup'),
		name: 'nobackup'
	    });
	}

	var width2 = 120;

        me.mbps_rd = Ext.widget('numberfield', {
            name: 'mbps_rd',
            minValue: 1,
	    step: 1,
            fieldLabel: gettext('Read limit') + ' (MB/s)',
	    labelWidth: width2,
	    emptyText: gettext('unlimited')
        });
        me.column2.push(me.mbps_rd);

        me.mbps_wr = Ext.widget('numberfield', {
            name: 'mbps_wr',
            minValue: 1,
	    step: 1,
            fieldLabel: gettext('Write limit') + ' (MB/s)',
	    labelWidth: width2,
	    emptyText: gettext('unlimited')
        });
        me.column2.push(me.mbps_wr);

        me.iops_rd = Ext.widget('numberfield', {
            name: 'iops_rd',
            minValue: 10,
	    step: 10,
            fieldLabel: gettext('Read limit') + ' (ops/s)',
	    labelWidth: width2,
	    emptyText: gettext('unlimited')
        });
        me.column2.push(me.iops_rd);

        me.iops_wr = Ext.widget('numberfield', {
            name: 'iops_wr',
            minValue: 10,
	    step: 10,
            fieldLabel: gettext('Write limit') + ' (ops/s)',
	    labelWidth: width2,
	    emptyText: gettext('unlimited')
        });
        me.column2.push(me.iops_wr);

	me.callParent();
    }
});

Ext.define('PVE.qemu.HDEdit', {
    extend: 'PVE.window.Edit',

    isAdd: true,

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) { 
	    throw "no node name specified";	    
	}

	var unused = me.confid && me.confid.match(/^unused\d+$/);

	me.create = me.confid ? unused : true;

	var ipanel = Ext.create('PVE.qemu.HDInputPanel', {
	    confid: me.confid,
	    nodename: nodename,
	    unused: unused,
	    create: me.create
	});

	var subject;
	if (unused) {
	    me.subject = gettext('Unused Disk');
	} else if (me.create) {
            me.subject = gettext('Hard Disk');
	} else {
           me.subject = gettext('Hard Disk') + ' (' + me.confid + ')';
	}

	me.items = [ ipanel ];

	me.callParent();
	
	me.load({
	    success: function(response, options) {
		ipanel.setVMConfig(response.result.data);
		if (me.confid) {
		    var value = response.result.data[me.confid];
		    var drive = PVE.Parser.parseQemuDrive(me.confid, value);
		    if (!drive) {
			Ext.Msg.alert('Error', 'Unable to parse drive options');
			me.close();
			return;
		    }
		    ipanel.setDrive(drive);
		    me.isValid(); // trigger validation
		}
	    }
	});
    }
});
Ext.define('PVE.window.HDResize', {
    extend: 'Ext.window.Window',

    resizable: false,

    resize_disk: function(disk, size) {
	var me = this;
        var params =  { disk: disk, size: '+' + size + 'G' };

	PVE.Utils.API2Request({
	    params: params,
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/resize',
	    waitMsgTarget: me,
	    method: 'PUT',
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, options) {
		me.close();
	    }
	});
    },

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	var items = [
	    {
		xtype: 'displayfield',
		name: 'disk',
		value: me.disk,
		fieldLabel: 'Disk',
		vtype: 'StorageId',
		allowBlank: false
	    }
	];

	me.hdsizesel = Ext.createWidget('numberfield', {
	    name: 'size',
	    minValue: 0,
	    maxValue: 128*1024,
	    decimalPrecision: 3,
	    value: '0',
	    fieldLabel: gettext('Size Increment') + ' (GB)',
	    allowBlank: false
	});

	items.push(me.hdsizesel);

	me.formPanel = Ext.create('Ext.form.Panel', {
	    bodyPadding: 10,
	    border: false,
	    fieldDefaults: {
		labelWidth: 120,
		anchor: '100%'
	    },
	    items: items
	});

	var form = me.formPanel.getForm();

	var submitBtn;

	me.title = gettext('Resize disk');
	submitBtn = Ext.create('Ext.Button', {
	    text: gettext('Resize disk'),
	    handler: function() {
		if (form.isValid()) {
		    var values = form.getValues();
		    me.resize_disk(me.disk, values.size);
		}
	    }
	});

	Ext.apply(me, {
	    modal: true,
	    width: 250,
	    height: 150,
	    border: false,
	    layout: 'fit',
	    buttons: [ submitBtn ],
	    items: [ me.formPanel ]
	});


	me.callParent();

	if (!me.disk) {
	    return;
	}

    }
});
Ext.define('PVE.window.HDMove', {
    extend: 'Ext.window.Window',

    resizable: false,


    move_disk: function(disk, storage, format, delete_disk) {
	var me = this;

        var params =  { disk: disk, storage: storage };

        if (format) {
            params.format = format;
        }
	
	if (delete_disk) {
	    params['delete'] = 1;
	}

	PVE.Utils.API2Request({
	    params: params,
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/move_disk',
	    waitMsgTarget: me,
	    method: 'POST',
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, options) {
		var upid = response.result.data;
		var win = Ext.create('PVE.window.TaskViewer', { upid: upid });
		win.show();
		me.close();
	    }
	});

    },

    initComponent : function() {
	var me = this;

	var diskarray = [];

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

        var items = [
            {
                xtype: 'displayfield',
                name: 'disk',
                value: me.disk,
                fieldLabel: 'Disk',
                vtype: 'StorageId',
                allowBlank: false
            }
        ];

        me.hdstoragesel = Ext.create('PVE.form.StorageSelector', {
                name: 'hdstorage',
                nodename: me.nodename,
                fieldLabel: 'Target Storage',
                storageContent: 'images',
                autoSelect: me.insideWizard,
                allowBlank: true,
                disabled: false,
                hidden: false,
                listeners: {
                    change: function(f, value) {
                        var rec = f.store.getById(value);
			if (rec.data.type === 'iscsi') {
                            me.formatsel.setValue('raw');
                            me.formatsel.setDisabled(true);
                        } else if (rec.data.type === 'lvm' ||
                                   rec.data.type === 'rbd' ||
                                   rec.data.type === 'sheepdog' ||
                                   rec.data.type === 'nexenta'
                        ) {
                            me.formatsel.setValue('raw');
                            me.formatsel.setDisabled(true);
                        } else {
                            me.formatsel.setDisabled(false);
                        }

                    }
                }

	});

	me.formatsel = Ext.create('PVE.form.DiskFormatSelector', {
		name: 'diskformat',
		fieldLabel: gettext('Format'),
		value: 'raw',
                disabled: true,
                hidden: false,
		allowBlank: false
	});


   
	items.push(me.hdstoragesel);
	items.push(me.formatsel);

	items.push({
	    xtype: 'pvecheckbox',
	    fieldLabel: gettext('Delete source'),
	    name: 'deleteDisk',
	    uncheckedValue: 0,
	    checked: false
	});

	me.formPanel = Ext.create('Ext.form.Panel', {
	    bodyPadding: 10,
	    border: false,
	    fieldDefaults: {
		labelWidth: 100,
		anchor: '100%'
	    },
	    items: items
	});

	var form = me.formPanel.getForm();

	var submitBtn;

	me.title =  gettext("Move disk");
	submitBtn = Ext.create('Ext.Button', {
	    text: gettext('Move disk'),
	    handler: function() {
		if (form.isValid()) {
		    var values = form.getValues();
		    me.move_disk(me.disk, values.hdstorage, values.diskformat,
				 values.deleteDisk);
		}
	    }
	});

	Ext.apply(me, {
	    modal: true,
	    width: 350,
	    border: false,
	    layout: 'fit',
	    buttons: [ submitBtn ],
	    items: [ me.formPanel ]
	});


	me.callParent();


    }
});
Ext.define('PVE.qemu.DisplayEdit', {
    extend: 'PVE.window.Edit',

    vmconfig: undefined,

    initComponent : function() {
	var me = this;

	var displayField;

	var validateDisplay = function() {
	    /*jslint confusion: true */
	    var val = displayField.getValue();

	    if (me.vmconfig && val.match(/^serial\d+$/)) {
		if (me.vmconfig[val] && me.vmconfig[val] === 'socket') {
		    return true;
		}
		return "Serial interface '" + val + "' is not correctly configured.";
	    }
	    
	    return true;
	};

	displayField = Ext.createWidget('DisplaySelector', {  
	    name: 'vga',
	    value: '',
	    fieldLabel: gettext('Graphic card'),
	    validator: validateDisplay
	});

	Ext.apply(me, {
	    subject: gettext('Display'),
	    width: 350,
	    items: displayField
	});

	me.callParent();

	me.load({
	    success: function(response, options) {
		var values = response.result.data;

		me.vmconfig = values;

		me.setValues(values);
	    }
	});
    }
});
Ext.define('PVE.qemu.KeyboardEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	Ext.applyIf(me, {
	    subject: gettext('Keyboard Layout'),
	    items: {
		xtype: 'VNCKeyboardSelector',
		name: 'keyboard',
		value: '',
		fieldLabel: gettext('Keyboard Layout')
	    }
	});

	me.callParent();

	me.load();
    }
});
// fixme: howto avoid jslint type confusion?
/*jslint confusion: true */
Ext.define('PVE.qemu.HardwareView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.PVE.qemu.HardwareView'],

    renderKey: function(key, metaData, record, rowIndex, colIndex, store) {
	var me = this;
	var rows = me.rows;
	var rowdef = rows[key] || {};

	if (rowdef.tdCls) {
	    metaData.tdCls = rowdef.tdCls;
	    if (rowdef.tdCls == 'pve-itype-icon-storage') { 
		if (record.data.value.match(/media=cdrom/)) {
		    metaData.tdCls = 'pve-itype-icon-cdrom';
		    return rowdef.cdheader;
		}
	    }
	}
	return rowdef.header || key;
    },

    initComponent : function() {
	var me = this;
	var i, confid;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) { 
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	var rows = {
	    memory: {
		header: gettext('Memory'),
		editor: caps.vms['VM.Config.Memory'] ? 'PVE.qemu.MemoryEdit' : undefined,
		never_delete: true,
		defaultValue: 512,
		tdCls: 'pve-itype-icon-memory',
		renderer: function(value, metaData, record) {
		    var balloon =  me.getObjectValue('balloon');
		    if (balloon) {
			return PVE.Utils.format_size(balloon*1024*1024) + "/" + 
			    PVE.Utils.format_size(value*1024*1024);

		    } 
		    return PVE.Utils.format_size(value*1024*1024);
		}
	    },
	    sockets: {
		header: gettext('Processors'),
		never_delete: true,
		editor: (caps.vms['VM.Config.CPU'] || caps.vms['VM.Config.HWType']) ? 
		    'PVE.qemu.ProcessorEdit' : undefined,
		tdCls: 'pve-itype-icon-processor',
		defaultValue: 1,
		renderer: function(value, metaData, record, rowIndex, colIndex, store) {
		    var model = me.getObjectValue('cpu');
		    var cores = me.getObjectValue('cores');
		    var res = '';
		    if (!cores || (cores <= 1)) {
			res = value;
		    } else {
			res = (value*cores) + ' (' + value + ' sockets, ' + cores + ' cores)';
		    }
		    if (model) {
			res += ' [' + model + ']';
		    }
		    return res;
		}
	    },
	    keyboard: {
		header: gettext('Keyboard Layout'),
		never_delete: true,
		editor: caps.vms['VM.Config.Options'] ? 'PVE.qemu.KeyboardEdit' : undefined,
		tdCls: 'pve-itype-icon-keyboard',
		defaultValue: '',
		renderer: PVE.Utils.render_kvm_language
	    },
	    vga: {
		header: gettext('Display'),
		editor: caps.vms['VM.Config.HWType'] ? 'PVE.qemu.DisplayEdit' : undefined,
		never_delete: true,
		tdCls: 'pve-itype-icon-display',
		defaultValue: '',
		renderer: PVE.Utils.render_kvm_vga_driver		
	    },
	    cores: {
		visible: false
	    },
	    cpu: {
		visible: false
	    },
	    balloon: {
		visible: false
	    }
	};

	for (i = 0; i < 4; i++) {
	    confid = "ide" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 6; i++) {
	    confid = "sata" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 16; i++) {
	    confid = "scsi" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 16; i++) {
	    confid = "virtio" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 32; i++) {
	    confid = "net" + i;
	    rows[confid] = {
		group: 2,
		tdCls: 'pve-itype-icon-network',
		editor: caps.vms['VM.Config.Network'] ? 'PVE.qemu.NetworkEdit' : undefined,
		never_delete: caps.vms['VM.Config.Network'] ? false : true,
		header: gettext('Network Device') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 8; i++) {
	    rows["unused" + i] = {
		group: 3,
		tdCls: 'pve-itype-icon-storage',
		editor: caps.vms['VM.Config.Disk'] ? 'PVE.qemu.HDEdit' : undefined,
		header: gettext('Unused Disk') + ' ' + i
	    };
	}

	var sorterFn = function(rec1, rec2) {
	    var v1 = rec1.data.key;
	    var v2 = rec2.data.key;
	    var g1 = rows[v1].group || 0;
	    var g2 = rows[v2].group || 0;
	    
	    return (g1 !== g2) ? 
		(g1 > g2 ? 1 : -1) : (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
	};

	var reload = function() {
	    me.rstore.load();
	};

	var baseurl = 'nodes/' + nodename + '/qemu/' + vmid + '/config';

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var editor = rowdef.editor;
	    if (rowdef.tdCls == 'pve-itype-icon-storage') { 
		if (rec.data.value.match(/media=cdrom/)) {
		    editor = 'PVE.qemu.CDEdit';
		}
	    }

	    var win = Ext.create(editor, {
		pveSelNode: me.pveSelNode,
		confid: rec.data.key,
		url: '/api2/extjs/' + baseurl
	    });

	    win.show();
	    win.on('destroy', reload);
	};

	var run_resize = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var win = Ext.create('PVE.window.HDResize', {
		disk: rec.data.key,
		nodename: nodename,
		vmid: vmid
	    });

	    win.show();

	    win.on('destroy', reload);
	};

	var run_move = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var win = Ext.create('PVE.window.HDMove', {
		disk: rec.data.key,
		nodename: nodename,
		vmid: vmid
	    });

	    win.show();

	    win.on('destroy', reload);
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    selModel: sm,
	    disabled: true,
	    enableFn: function(rec) {
		if (!rec) {
		    return false;
		}
		var rowdef = rows[rec.data.key];
		return !!rowdef.editor;
	    },
	    handler: run_editor
	});

	var resize_btn = new PVE.button.Button({
	    text: gettext('Resize disk'),
	    selModel: sm,
	    disabled: true,
	    enableFn: function(rec) {
		if (!rec) {
		    return false;
		}
		var rowdef = rows[rec.data.key];
		return rowdef.tdCls == 'pve-itype-icon-storage' && !rec.data.value.match(/media=cdrom/);
	    },
	    handler: run_resize
	});


	var move_btn = new PVE.button.Button({
	    text: gettext('Move disk'),
	    selModel: sm,
	    disabled: true,
	    enableFn: function(rec) {
		if (!rec || rec.data.key.match(/^unused\d+/)) {
		    return false;
		}
		var rowdef = rows[rec.data.key];
		return rowdef.tdCls == 'pve-itype-icon-storage' && !rec.data.value.match(/media=cdrom/);
	    },
	    handler: run_move
	});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    selModel: sm,
	    disabled: true,
	    dangerous: true,
	    confirmMsg: function(rec) {
		var msg = Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					    "'" + me.renderKey(rec.data.key, {}, rec) + "'");
		if (rec.data.key.match(/^unused\d+$/)) {
		    msg += " " + gettext('This will permanently erase all image data.');
		}

		return msg;
	    },
	    enableFn: function(rec) {
		if (!rec) {
		    return false;
		}
		var rowdef = rows[rec.data.key];

		return rowdef.never_delete !== true;    
	    },
	    handler: function(b, e, rec) {
		PVE.Utils.API2Request({
		    url: '/api2/extjs/' + baseurl,
		    waitMsgTarget: me,
		    method: 'PUT',
		    params: {
			'delete': rec.data.key
		    },
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert('Error',response.htmlStatus);
		    }
		});
	    }
	});

	Ext.applyIf(me, {
	    url: '/api2/json/' + baseurl,
	    selModel: sm,
	    cwidth1: 170,
	    tbar: [ 
		{
		    text: gettext('Add'),
		    menu: new Ext.menu.Menu({
			items: [
			    {
				text: gettext('Hard Disk'),
				iconCls: 'pve-itype-icon-storage',
				disabled: !caps.vms['VM.Config.Disk'],
				handler: function() {
				    var win = Ext.create('PVE.qemu.HDEdit', {
					url: '/api2/extjs/' + baseurl,
					pveSelNode: me.pveSelNode
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: gettext('CD/DVD Drive'),
				iconCls: 'pve-itype-icon-cdrom',
				disabled: !caps.vms['VM.Config.Disk'],
				handler: function() {
				    var win = Ext.create('PVE.qemu.CDEdit', {
					url: '/api2/extjs/' + baseurl,
					pveSelNode: me.pveSelNode
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: gettext('Network Device'),
				iconCls: 'pve-itype-icon-network',
				disabled: !caps.vms['VM.Config.Network'],
				handler: function() {
				    var win = Ext.create('PVE.qemu.NetworkEdit', {
					url: '/api2/extjs/' + baseurl,
					pveSelNode: me.pveSelNode
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    }
			]
		    })
		}, 
		remove_btn,
		edit_btn,
		resize_btn,
		move_btn
	    ],
	    rows: rows,
	    sorterFn: sorterFn,
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.qemu.StartupInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	var res = PVE.Parser.printStartup(values);

	if (res === undefined || res === '') {
	    return { 'delete': 'startup' };
	}

	return { startup: res };
    },

    setStartup: function(value) {
	var me = this;

	var startup = PVE.Parser.parseStartup(value);
	if (startup) {
	    me.setValues(startup);
	}
    },

    initComponent : function() {
	var me = this;

	me.items = [
	    {
		xtype: 'textfield',
		name: 'order',
		defaultValue: '',
		emptyText: 'any',
		fieldLabel: gettext('Start/Shutdown order')
	    },
	    {
		xtype: 'textfield',
		name: 'up',
		defaultValue: '',
		emptyText: 'default',
		fieldLabel: gettext('Startup delay')
	    },
	    {
		xtype: 'textfield',
		name: 'down',
		defaultValue: '',
		emptyText: 'default',
		fieldLabel: gettext('Shutdown timeout')
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.qemu.StartupEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	/*jslint confusion: true */

	var me = this;

	var ipanel = Ext.create('PVE.qemu.StartupInputPanel', {});

	Ext.applyIf(me, {
	    subject: gettext('Start/Shutdown order'),
	    fieldDefaults: {
		labelWidth: 120
	    },
	    items: ipanel
	});

	me.callParent();

	me.load({
	    success: function(response, options) {
		var i, confid;
		me.vmconfig = response.result.data;
		ipanel.setStartup(me.vmconfig.startup);		    
	    }
	});
    }
});
Ext.define('PVE.qemu.ScsiHwEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	Ext.applyIf(me, {
	    subject: gettext('SCSI Controller Type'),
	    items: {
		xtype: 'pveScsiHwSelector',
		name: 'scsihw',
		value: '',
		fieldLabel: gettext('Type')
	    }
	});

	me.callParent();

	me.load();
    }
});
/*jslint confusion: true */
Ext.define('PVE.qemu.Options', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.PVE.qemu.Options'],

    initComponent : function() {
	var me = this;
	var i;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	var rows = {
	    name: {
		required: true,
		defaultValue: me.pveSelNode.data.name,
		header: gettext('Name'),
		editor: caps.vms['VM.Config.Options'] ? {
		    xtype: 'pveWindowEdit',
		    subject: gettext('Name'),
		    items: {
			xtype: 'textfield',
			name: 'name',
			vtype: 'DnsName',
			value: '',
			fieldLabel: gettext('Name'),
			allowBlank: true
		    }
		} : undefined
	    },
	    onboot: {
		header: gettext('Start at boot'),
		defaultValue: '',
		renderer: PVE.Utils.format_boolean,
		editor: caps.vms['VM.Config.Options'] ? {
		    xtype: 'pveWindowEdit',
		    subject: gettext('Start at boot'),
		    items: {
			xtype: 'pvecheckbox',
			name: 'onboot',
			uncheckedValue: 0,
			defaultValue: 0,
			deleteDefaultValue: true,
			fieldLabel: gettext('Start at boot')
		    }
		} : undefined
	    },
	    startup: {
		header: gettext('Start/Shutdown order'),
		defaultValue: '',
		renderer: PVE.Utils.render_kvm_startup,
		editor: caps.vms['VM.Config.Options'] && caps.nodes['Sys.Modify'] ? 
		    'PVE.qemu.StartupEdit' : undefined
	    },
	    ostype: {
		header: 'OS Type',
		editor: caps.vms['VM.Config.Options'] ? 'PVE.qemu.OSTypeEdit' : undefined,
		renderer: PVE.Utils.render_kvm_ostype,
		defaultValue: 'other'
	    },
	    bootdisk: {
		visible: false
	    },
	    boot: {
		header: gettext('Boot order'),
		defaultValue: 'cdn',
		editor: caps.vms['VM.Config.Disk'] ? 'PVE.qemu.BootOrderEdit' : undefined,
		renderer: function(order) {
		    var i;
		    var text = '';
		    var bootdisk = me.getObjectValue('bootdisk');
		    order = order || 'cdn';
		    for (i = 0; i < order.length; i++) {
			var sel = order.substring(i, i + 1);
			if (text) {
			    text += ', ';
			}
			if (sel === 'c') {
			    if (bootdisk) {
				text += "Disk '" + bootdisk + "'";
			    } else {
				text += "Disk";
			    }
			} else if (sel === 'n') {
			    text += 'Network';
			} else if (sel === 'a') {
			    text += 'Floppy';
			} else if (sel === 'd') {
			    text += 'CD-ROM';
			} else {
			    text += sel;
			}
		    }
		    return text;
		}
	    },
	    tablet: {
		header: 'Use tablet for pointer',
		defaultValue: true,
		renderer: PVE.Utils.format_boolean,
		editor: caps.vms['VM.Config.HWType'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'Use tablet for pointer',
		    items: {
			xtype: 'pvecheckbox',
			name: 'tablet',
			checked: true,
			uncheckedValue: 0,
			defaultValue: 1,
			deleteDefaultValue: true,
			fieldLabel: gettext('Enabled')
		    }
		} : undefined
	    },
	    acpi: {
		header: 'ACPI support',
		defaultValue: true,
		renderer: PVE.Utils.format_boolean,
		editor: caps.vms['VM.Config.HWType'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'ACPI support',
		    items: {
			xtype: 'pvecheckbox',
			name: 'acpi',
			checked: true,
			uncheckedValue: 0,
			defaultValue: 1,
			deleteDefaultValue: true,
			fieldLabel: gettext('Enabled')
		    }
		} : undefined
	    },
	    scsihw: {
		header: 'SCSI Controller Type',
		editor: caps.vms['VM.Config.Options'] ? 'PVE.qemu.ScsiHwEdit' : undefined,
		renderer: PVE.Utils.render_scsihw,
		defaultValue: ''
	    },
	    kvm: {
		header: 'KVM hardware virtualization',
		defaultValue: true,
		renderer: PVE.Utils.format_boolean,
		editor: caps.vms['VM.Config.HWType'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'KVM hardware virtualization',
		    items: {
			xtype: 'pvecheckbox',
			name: 'kvm',
			checked: true,
			uncheckedValue: 0,
			defaultValue: 1,
			deleteDefaultValue: true,
			fieldLabel: gettext('Enabled')
		    }
		} : undefined
	    },
	    cpuunits: {
		header: 'CPU units',
		defaultValue: '1000',
		editor: caps.vms['VM.Config.CPU'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'CPU units',
		    items: {
			xtype: 'numberfield',
			name: 'cpuunits',
			fieldLabel: 'CPU units',
			minValue: 8,
			maxValue: 500000,
			defaultValue: 1000,
			allowBlank: false
		    }
		} : undefined
	    },
	    freeze: {
		header: 'Freeze CPU at startup',
		defaultValue: false,
		renderer: PVE.Utils.format_boolean,
		editor: caps.vms['VM.PowerMgmt'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'Freeze CPU at startup',
		    items: {
			xtype: 'pvecheckbox',
			name: 'freeze',
			uncheckedValue: 0,
			defaultValue: 0,
			deleteDefaultValue: true,
			labelWidth: 140,
			fieldLabel: 'Freeze CPU at startup'
		    }
		} : undefined
	    },
	    localtime: {
		header: 'Use local time for RTC',
		defaultValue: false,
		renderer: PVE.Utils.format_boolean,
		editor: caps.vms['VM.Config.Options'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'Use local time for RTC',
		    items: {
			xtype: 'pvecheckbox',
			name: 'localtime',
			uncheckedValue: 0,
			defaultValue: 0,
			deleteDefaultValue: true,
			labelWidth: 140,
			fieldLabel: 'Use local time for RTC'
		    }
		} : undefined
	    },
	    startdate: {
		header: 'RTC start date',
		defaultValue: 'now',
		editor: caps.vms['VM.Config.Options'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'RTC start date',
		    items: {
			xtype: 'pvetextfield',
			name: 'startdate',
			deleteEmpty: true,
			value: 'now',
			fieldLabel: 'RTC start date',
			vtype: 'QemuStartDate',
			allowBlank: true
		    }
		} : undefined
	    }
	};

	var baseurl = 'nodes/' + nodename + '/qemu/' + vmid + '/config';

	var reload = function() {
	    me.rstore.load();
	};

	var run_editor = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var win;
	    if (Ext.isString(rowdef.editor)) {
		win = Ext.create(rowdef.editor, {
		    pveSelNode: me.pveSelNode,
		    confid: rec.data.key,
		    url: '/api2/extjs/' + baseurl
		});
	    } else {
		var config = Ext.apply({
		    pveSelNode: me.pveSelNode,
		    confid: rec.data.key,
		    url: '/api2/extjs/' + baseurl
		}, rowdef.editor);
		win = Ext.createWidget(rowdef.editor.xtype, config);
		win.load();
	    }

	    win.show();
	    win.on('destroy', reload);
	};

	var edit_btn = new Ext.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    handler: run_editor
	});

	var set_button_status = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];

	    if (!rec) {
		edit_btn.disable();
		return;
	    }
	    var rowdef = rows[rec.data.key];
	    edit_btn.setDisabled(!rowdef.editor);
	};

	Ext.applyIf(me, {
	    url: "/api2/json/nodes/" + nodename + "/qemu/" + vmid + "/config",
	    cwidth1: 150,
	    tbar: [ edit_btn ],
	    rows: rows,
	    listeners: {
		itemdblclick: run_editor,
		selectionchange: set_button_status
	    }
	});

	me.callParent();

	me.on('show', reload);
    }
});

Ext.define('PVE.window.Snapshot', {
    extend: 'Ext.window.Window',

    resizable: false,

    take_snapshot: function(snapname, descr, vmstate) {
	var me = this;
	var params = { snapname: snapname, vmstate: vmstate ? 1 : 0 };
	if (descr) {
	    params.description = descr;
	}

	PVE.Utils.API2Request({
	    params: params,
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + "/snapshot",
	    waitMsgTarget: me,
	    method: 'POST',
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, options) {
		var upid = response.result.data;
		var win = Ext.create('PVE.window.TaskProgress', { upid: upid });
		win.show();
		me.close();
	    }
	});
    },

    update_snapshot: function(snapname, descr) {
	var me = this;
	PVE.Utils.API2Request({
	    params: { description: descr },
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + "/snapshot/" + 
		snapname + '/config',
	    waitMsgTarget: me,
	    method: 'PUT',
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, options) {
		me.close();
	    }
	});
    },

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	var summarystore = Ext.create('Ext.data.Store', {
	    model: 'KeyValue',
	    sorters: [
		{
		    property : 'key',
		    direction: 'ASC'
		}
	    ]
	});

	var items = [
	    {
		xtype: me.snapname ? 'displayfield' : 'textfield',
		name: 'snapname',
		value: me.snapname,
		fieldLabel: gettext('Name'),
		vtype: 'StorageId',
		allowBlank: false
	    }
	];

	if (me.snapname) {
	    items.push({
		xtype: 'displayfield',
		name: 'snaptime',
		fieldLabel: gettext('Timestamp')
	    });
	} else {
	    items.push({
		xtype: 'pvecheckbox',
		name: 'vmstate',
		uncheckedValue: 0,
		defaultValue: 0,
		checked: 1,
		fieldLabel: gettext('Include RAM')
	    });
	}

	items.push({
	    xtype: 'textareafield',
	    grow: true,
	    name: 'description',
	    fieldLabel: gettext('Description')
	});

	if (me.snapname) {
	    items.push({
		title: gettext('Settings'),
		xtype: 'grid',
		height: 200,
		store: summarystore,
		columns: [
		    {header: 'Key', width: 150, dataIndex: 'key'},
		    {header: 'Value', flex: 1, dataIndex: 'value'}
		]
	    });
	}

	me.formPanel = Ext.create('Ext.form.Panel', {
	    bodyPadding: 10,
	    border: false,
	    fieldDefaults: {
		labelWidth: 100,
		anchor: '100%'
	    },
	    items: items
	});

	var form = me.formPanel.getForm();

	var submitBtn;

	if (me.snapname) {
	    me.title = gettext('Edit') + ': ' + gettext('Snapshot');
	    submitBtn = Ext.create('Ext.Button', {
		text: gettext('Update'),
		handler: function() {
		    if (form.isValid()) {
			var values = form.getValues();
			me.update_snapshot(me.snapname, values.description);
		    }
		}
	    });
	} else {
	    me.title ="VM " + me.vmid + ': ' + gettext('Take Snapshot');
	    submitBtn = Ext.create('Ext.Button', {
		text: gettext('Take Snapshot'),
		handler: function() {
		    if (form.isValid()) {
			var values = form.getValues();
			me.take_snapshot(values.snapname, values.description, values.vmstate);
		    }
		}
	    });
	}

	Ext.apply(me, {
	    modal: true,
	    width: 450,
	    border: false,
	    layout: 'fit',
	    buttons: [ submitBtn ],
	    items: [ me.formPanel ]
	});

	if (me.snapname) {
	    Ext.apply(me, {
		width: 620,
		height: 400
	    });
	}	 

	me.callParent();

	if (!me.snapname) {
	    return;
	}

	// else load data
	PVE.Utils.API2Request({
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + "/snapshot/" + 
		me.snapname + '/config',
	    waitMsgTarget: me,
	    method: 'GET',
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
		me.close();
	    },
	    success: function(response, options) {
		var data = response.result.data;
		var kvarray = [];
		Ext.Object.each(data, function(key, value) {
		    if (key === 'description' || key === 'snaptime') {
			return;
		    }
		    kvarray.push({ key: key, value: value });
		});

		summarystore.suspendEvents();
		summarystore.add(kvarray);
		summarystore.sort();
		summarystore.resumeEvents();
		summarystore.fireEvent('datachanged', summarystore);

		form.findField('snaptime').setValue(new Date(data.snaptime));
		form.findField('description').setValue(data.description);
	    }
	});
    }
});
Ext.define('PVE.window.Clone', {
    extend: 'Ext.window.Window',

    resizable: false,

    isTemplate: false,

    create_clone: function(values) {
	var me = this;

        var params = { newid: values.newvmid };

        if (values.snapname && values.snapname !== 'current') {
            params.snapname = values.snapname;
        }

	if (values.pool) {
	    params.pool = values.pool;
	}

	if (values.name) {
	    params.name = values.name;
	}

	if (values.target) {
	    params.target = values.target;
	}

	if (values.clonemode === 'copy') {
	    params.full = 1;
	    if (values.storage) {
		params.storage = values.storage;
		if (values.diskformat) {
		    params.format = values.diskformat;
		}
	    }
	}

	PVE.Utils.API2Request({
	    params: params,
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/clone',
	    waitMsgTarget: me,
	    method: 'POST',
	    failure: function(response, opts) {
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, options) {
		me.close();
	    }
	});

    },

    updateVisibility: function() {
	var me = this;

	var clonemode = me.kv1.getValue();
	var storage = me.hdstoragesel.getValue();
	var rec = me.hdstoragesel.store.getById(storage);

	me.hdstoragesel.setDisabled(clonemode === 'clone');

	if (!rec || clonemode === 'clone') {
            me.formatsel.setDisabled(true);
	    return;
	}

	if (rec.data.type === 'lvm' ||
            rec.data.type === 'rbd' ||
            rec.data.type === 'iscsi' ||
            rec.data.type === 'sheepdog' ||
            rec.data.type === 'nexenta'
           ) {
            me.formatsel.setValue('raw');
            me.formatsel.setDisabled(true);
        } else {
            me.formatsel.setDisabled(false);
        }
    },

    verifyFeature: function() {
	var me = this;
		    
	var snapname = me.snapshotSel.getValue();
	var clonemode = me.kv1.getValue();

	var params = { feature: clonemode };
	if (snapname !== 'current') {
	    params.snapname = snapname;
	}

	PVE.Utils.API2Request({
	    waitMsgTarget: me,
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/feature',
	    params: params,
	    method: 'GET',
	    failure: function(response, opts) {
		me.submitBtn.setDisabled(false);
		Ext.Msg.alert('Error', response.htmlStatus);
	    },
	    success: function(response, options) {
                var res = response.result.data;
		me.submitBtn.setDisabled(res.hasFeature !== 1);

		me.targetSel.allowedNodes = res.nodes;
		me.targetSel.validate();
	    }
	});
    },

    initComponent : function() {
	/*jslint confusion: true */
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	if (!me.snapname) {
	    me.snapname = 'current';
	}

	var col1 = [];
	var col2 = [];

	me.targetSel = Ext.create('PVE.form.NodeSelector', {
	    name: 'target',
	    fieldLabel: 'Target node',
	    selectCurNode: true,
	    allowBlank: false,
	    onlineValidator: true
	});

	col1.push(me.targetSel);

	var modelist = [['copy', 'Full Clone']];
	if (me.isTemplate) {
	    modelist.push(['clone', 'Linked Clone']);
	}

        me.kv1 = Ext.create('PVE.form.KVComboBox', {
            fieldLabel: 'Clone Mode',
            name: 'clonemode',
            allowBlank: false,
	    value: me.isTemplate ? 'clone' : 'copy',
            data: modelist
        });

        me.mon(me.kv1, 'change', function(t, value) {
	    me.updateVisibility();
	    me.verifyFeature();
        });

	col2.push(me.kv1);

	me.snapshotSel = Ext.create('PVE.form.SnapshotSelector', {
	    name: 'snapname',
	    fieldLabel: 'Snapshot',
            nodename: me.nodename,
            vmid: me.vmid,
	    hidden: me.isTemplate ? true : false,
            disabled: false,
	    allowBlank: false,
	    value : me.snapname,
	    listeners: {
		change: function(f, value) {
		    me.verifyFeature();
		}
	    }
	});

	col2.push(me.snapshotSel);

	col1.push(
	    {
                xtype: 'pveVMIDSelector',
                name: 'newvmid',
                value: '',
                loadNextFreeVMID: true,
                validateExists: false
            },
	    {
		xtype: 'textfield',
		name: 'name',
		allowBlank: true,
		fieldLabel: 'Name'
	    }
	);

        me.hdstoragesel = Ext.create('PVE.form.StorageSelector', {
                name: 'storage',
                nodename: me.nodename,
                fieldLabel: 'Target Storage',
                storageContent: 'images',
                autoSelect: me.insideWizard,
                allowBlank: true,
                disabled: me.isTemplate ? true : false, // because default mode is clone for templates
                hidden: false,
                listeners: {
                    change: function(f, value) {
			me.updateVisibility();
                    }
                }

	});

	me.targetSel.on('change', function(f, value) {
	    me.hdstoragesel.setTargetNode(value);
	});

	me.formatsel = Ext.create('PVE.form.DiskFormatSelector', {
	    name: 'diskformat',
	    fieldLabel: gettext('Format'),
	    value: 'raw',
            disabled: true,
            hidden: false,
	    allowBlank: false
	});

	col2.push({
	    xtype: 'pvePoolSelector',
	    fieldLabel: gettext('Resource Pool'),
	    name: 'pool',
	    value: '',
	    allowBlank: true
	});

	col2.push(me.hdstoragesel);
	col2.push(me.formatsel);

	me.formPanel = Ext.create('Ext.form.Panel', {
	    bodyPadding: 10,
	    border: false,
	    layout: 'column',
	    defaultType: 'container',
	    columns: 2,
	    fieldDefaults: {
		labelWidth: 100,
		anchor: '100%'
	    },
	    items: [
		{
		    columnWidth: 0.5,
		    padding: '0 10 0 0',
		    layout: 'anchor',
		    items: col1
		},
		{
		    columnWidth: 0.5,
		    padding: '0 0 0 10',
		    layout: 'anchor',
		    items: col2
		}
	    ]
	});

	var form = me.formPanel.getForm();

	var titletext = me.isTemplate ? "Template" : "VM";
	me.title = "Clone " + titletext + " " + me.vmid;
	
	me.submitBtn = Ext.create('Ext.Button', {
	    text: gettext('Clone'),
	    disabled: true,
	    handler: function() {
		if (form.isValid()) {
		    var values = form.getValues();
		    me.create_clone(values);
		}
	    }
	});
	
	Ext.apply(me, {
	    modal: true,
	    width: 600,
	    height: 250,
	    border: false,
	    layout: 'fit',
	    buttons: [ me.submitBtn ],
	    items: [ me.formPanel ]
	});

	me.callParent();

	me.verifyFeature();
    }
});
Ext.define('PVE.qemu.SnapshotTree', {
    extend: 'Ext.tree.Panel',
    alias: ['widget.pveQemuSnapshotTree'],

    load_delay: 3000,

    old_digest: 'invalid',

    sorterFn: function(rec1, rec2) {
	var v1 = rec1.data.snaptime;
	var v2 = rec2.data.snaptime;

	if (rec1.data.name === 'current') {
	    return 1;
	}
	if (rec2.data.name === 'current') {
	    return -1;
	}

	return (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
    },

    reload: function(repeat) {
        var me = this;

	PVE.Utils.API2Request({
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/snapshot',
	    method: 'GET',
	    failure: function(response, opts) {
		PVE.Utils.setErrorMask(me, response.htmlStatus);
		me.load_task.delay(me.load_delay);
	    },
	    success: function(response, opts) {
		PVE.Utils.setErrorMask(me, false);
		var digest = 'invalid';
		var idhash = {};
		var root = { name: '__root', expanded: true, children: [] };
		Ext.Array.each(response.result.data, function(item) {
		    item.leaf = true;
		    item.children = [];
		    if (item.name === 'current') {
			digest = item.digest + item.running;
			if (item.running) {
			    item.iconCls = 'x-tree-node-computer-running';
			} else {
			    item.iconCls = 'x-tree-node-computer';
			}
		    } else {
			item.iconCls = 'x-tree-node-snapshot';
		    }
		    idhash[item.name] = item;
		});

		if (digest !== me.old_digest) {
		    me.old_digest = digest;

		    Ext.Array.each(response.result.data, function(item) {
			if (item.parent && idhash[item.parent]) {
			    var parent_item = idhash[item.parent];
			    parent_item.children.push(item);
			    parent_item.leaf = false;
			    parent_item.expanded = true;
			} else {
			    root.children.push(item);
			}
		    });

		    me.setRootNode(root);
		}

		me.load_task.delay(me.load_delay);
	    }
	});

        PVE.Utils.API2Request({
	    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/feature',
	    params: { feature: 'snapshot' },
            method: 'GET',
            success: function(response, options) {
                var res = response.result.data;
		if (res.hasFeature) {
		   Ext.getCmp('snapshotBtn').enable();
		}
            }
        });


    },

    initComponent: function() {
        var me = this;

	me.nodename = me.pveSelNode.data.node;
	if (!me.nodename) { 
	    throw "no node name specified";
	}

	me.vmid = me.pveSelNode.data.vmid;
	if (!me.vmid) {
	    throw "no VM ID specified";
	}

	me.load_task = new Ext.util.DelayedTask(me.reload, me);

	var sm = Ext.create('Ext.selection.RowModel', {});

	var valid_snapshot = function(record) {
	    return record && record.data && record.data.name &&
		record.data.name !== 'current';
	};

	var valid_snapshot_rollback = function(record) {
	    return record && record.data && record.data.name &&
		record.data.name !== 'current' && !record.data.snapstate;
	};

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (valid_snapshot(rec)) {
		var win = Ext.create('PVE.window.Snapshot', { 
		    snapname: rec.data.name,
		    nodename: me.nodename,
		    vmid: me.vmid
		});
		win.show();
		me.mon(win, 'close', me.reload, me);
	    }
	};

	var editBtn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    enableFn: valid_snapshot,
	    handler: run_editor
	});

	var rollbackBtn = new PVE.button.Button({
	    text: gettext('Rollback'),
	    disabled: true,
	    selModel: sm,
	    enableFn: valid_snapshot_rollback,
	    confirmMsg: function(rec) {
		var msg = Ext.String.format(gettext('Are you sure you want to rollback to snapshot {0}'),
					    "'" + rec.data.name + "'");
		return msg;
	    },
	    handler: function(btn, event) {
		var rec = sm.getSelection()[0];
		if (!rec) {
		    return;
		}
		var snapname = rec.data.name;

		PVE.Utils.API2Request({
		    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/snapshot/' + snapname + '/rollback',
		    method: 'POST',
		    waitMsgTarget: me,
		    callback: function() {
			me.reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    },
		    success: function(response, options) {
			var upid = response.result.data;
			var win = Ext.create('PVE.window.TaskProgress', { upid: upid });
			win.show();
		    }
		});
	    }
	});

	var removeBtn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: function(rec) {
		var msg = Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					    "'" + rec.data.name + "'");
		return msg;
	    },
	    enableFn: valid_snapshot,
	    handler: function(btn, event) {
		var rec = sm.getSelection()[0];
		if (!rec) {
		    return;
		}
		var snapname = rec.data.name;

		PVE.Utils.API2Request({
		    url: '/nodes/' + me.nodename + '/qemu/' + me.vmid + '/snapshot/' + snapname,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			me.reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    },
		    success: function(response, options) {
			var upid = response.result.data;
			var win = Ext.create('PVE.window.TaskProgress', { upid: upid });
			win.show();
		    }
		});
	    }
	});

	var snapshotBtn = Ext.create('Ext.Button', { 
	    id: 'snapshotBtn',
	    text: gettext('Take Snapshot'),
	    disabled: true,
	    handler: function() {
		var win = Ext.create('PVE.window.Snapshot', { 
		    nodename: me.nodename,
		    vmid: me.vmid
		});
		win.show();
	    }
	});

	Ext.apply(me, {
	    layout: 'fit',
	    rootVisible: false,
	    animate: false,
	    sortableColumns: false,
	    selModel: sm,
	    tbar: [ snapshotBtn, rollbackBtn, removeBtn, editBtn ],
	    fields: [ 
		'name', 'description', 'snapstate', 'vmstate', 'running',
		{ name: 'snaptime', type: 'date', dateFormat: 'timestamp' }
	    ],
	    columns: [
		{
		    xtype: 'treecolumn',
		    text: gettext('Name'),
		    dataIndex: 'name',
		    width: 200,
		    renderer: function(value, metaData, record) {
			if (value === 'current') {
			    return "NOW";
			} else {
			    return value;
			}
		    }
		},
		{
		    text: 'RAM',
		    align: 'center',
		    resizable: false,
		    dataIndex: 'vmstate',
		    width: 50,
		    renderer: function(value, metaData, record) {
			if (record.data.name !== 'current') {
			    return PVE.Utils.format_boolean(value);
			}
		    }
		},
		{
		    text: gettext('Date') + "/" + gettext("Status"),
		    dataIndex: 'snaptime',
		    resizable: false,
		    width: 120,
		    renderer: function(value, metaData, record) {
			if (record.data.snapstate) {
			    return record.data.snapstate;
			}
			if (value) {
			    return Ext.Date.format(value,'Y-m-d H:i:s');
			}
		    }
		},
		{ 
		    text: gettext('Description'),
		    dataIndex: 'description',
		    flex: 1,
		    renderer: function(value, metaData, record) {
			if (record.data.name === 'current') {
			    return gettext("You are here!");
			} else {
			    return value;
			}
		    }
		}
	    ],
	    columnLines: true, // will work in 4.1?
	    listeners: {
		show: me.reload,
		hide: me.load_task.cancel,
		destroy: me.load_task.cancel,
		// disable collapse
		beforeitemcollapse: function() { return false; },
		itemdblclick: run_editor
	    }
	});

	me.callParent();

	me.store.sorters.add(new Ext.util.Sorter({
	    sorterFn: me.sorterFn
	}));
    }
});

Ext.define('PVE.qemu.Config', {
    extend: 'PVE.panel.Config',
    alias: 'widget.PVE.qemu.Config',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	me.statusStore = Ext.create('PVE.data.ObjectStore', {
	    url: "/api2/json/nodes/" + nodename + "/qemu/" + vmid + "/status/current",
	    interval: 1000
	});

	var vm_command = function(cmd, params) {
	    PVE.Utils.API2Request({
		params: params,
		url: '/nodes/' + nodename + '/qemu/' + vmid + "/status/" + cmd,
		waitMsgTarget: me,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	var resumeBtn = Ext.create('Ext.Button', { 
	    text: gettext('Resume'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    visible: false,
	    handler: function() {
		vm_command('resume');
	    }			    
	}); 

	var startBtn = Ext.create('Ext.Button', { 
	    text: gettext('Start'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    handler: function() {
		vm_command('start');
	    }			    
	}); 
 
	var stopBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Stop'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    confirmMsg: Ext.String.format(gettext("Do you really want to stop VM {0}?"), vmid),
	    handler: function() {
		vm_command("stop", { timeout: 30 });
	    }
	});

	var migrateBtn = Ext.create('Ext.Button', { 
	    text: gettext('Migrate'),
	    disabled: !caps.vms['VM.Migrate'],
	    handler: function() {
		var win = Ext.create('PVE.window.Migrate', {
		    vmtype: 'qemu',
		    nodename: nodename,
		    vmid: vmid
		});
		win.show();
	    }    
	});
 
	var resetBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Reset'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    confirmMsg: Ext.String.format(gettext("Do you really want to reset VM {0}?"), vmid),
	    handler: function() { 
		vm_command("reset");
	    }
	});

	var shutdownBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Shutdown'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    confirmMsg: Ext.String.format(gettext("Do you really want to shutdown VM {0}?"), vmid),
	    handler: function() {
		vm_command('shutdown');
	    }			    
	});

	var removeBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Remove'),
	    disabled: !caps.vms['VM.Allocate'],
	    dangerous: true,
	    confirmMsg: Ext.String.format(gettext('Are you sure you want to remove VM {0}? This will permanently erase all VM data.'), vmid),
	    handler: function() {
		PVE.Utils.API2Request({
		    url: '/nodes/' + nodename + '/qemu/' + vmid,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    failure: function(response, opts) {
			Ext.Msg.alert('Error', response.htmlStatus);
		    }
		});
	    } 
	});

	var vmname = me.pveSelNode.data.name;

	var consoleBtn = Ext.create('Ext.Button', {
	    text: gettext('Console'),
	    disabled: !caps.vms['VM.Console'],
	    handler: function() {
		PVE.Utils.openConoleWindow('kvm', vmid, nodename, vmname);
	    }
	});

	var spiceBtn = Ext.create('Ext.Button', {
	    text: gettext('Spice'),
	    disabled: !caps.vms['VM.Console'],
	    handler: function() {
		Ext.core.DomHelper.append(document.body, {
		    tag : 'iframe',
		    id : 'downloadIframe',
		    frameBorder : 0,
		    width : 0,
		    height : 0,
		    css : 'display:none;visibility:hidden;height:0px;',
		    src : '/api2/spiceconfig/nodes/' + nodename + '/qemu/' + vmid + '/spiceproxy?proxy=' + 
			encodeURIComponent(window.location.hostname)
		});
	    }
	});

	var descr = vmid + " (" + (vmname ? "'" + vmname + "' " : "'VM " + vmid + "'") + ")";

	Ext.apply(me, {
	    title: Ext.String.format(gettext("Virtual Machine {0} on node {1}"), descr, "'" + nodename + "'"),
	    hstateid: 'kvmtab',
	    tbar: [ resumeBtn, startBtn, shutdownBtn, stopBtn, resetBtn, 
		    removeBtn, migrateBtn, consoleBtn, spiceBtn],
	    defaults: { statusStore: me.statusStore },
	    items: [
		{
		    title: gettext('Summary'),
		    xtype: 'pveQemuSummary',
		    itemId: 'summary'
		},
		{
		    title: gettext('Hardware'),
		    itemId: 'hardware',
		    xtype: 'PVE.qemu.HardwareView'
		},
		{
		    title: gettext('Options'),
		    itemId: 'options',
		    xtype: 'PVE.qemu.Options'
		},
		{
		    title: 'Task History',
		    itemId: 'tasks',
		    xtype: 'pveNodeTasks',
		    vmidFilter: vmid
		}
	    ]
	});

	if (caps.vms['VM.Monitor']) {
	    me.items.push({
		title: gettext('Monitor'),
		itemId: 'monitor',
		xtype: 'pveQemuMonitor'
	    });
	}

	if (caps.vms['VM.Backup']) {
	    me.items.push({
		title: gettext('Backup'),
		xtype: 'pveBackupView',
		itemId: 'backup'
	    });
	}

	if (caps.vms['VM.Snapshot']) {
	    me.items.push({
		title: gettext('Snapshots'),
		xtype: 'pveQemuSnapshotTree',
		itemId: 'snapshot'
	    });
	}

	if (caps.vms['Permissions.Modify']) {
	    me.items.push({
		xtype: 'pveACLView',
		title: gettext('Permissions'),
		itemId: 'permissions',
		path: '/vms/' + vmid
	    });
	}

	me.callParent();

        me.statusStore.on('load', function(s, records, success) {
	    var status;
	    var qmpstatus;
	    var template;
	    var spice;

	    if (!success) {
		me.workspace.checkVmMigration(me.pveSelNode);
		status = qmpstatus = 'unknown';
	    } else {
		var rec = s.data.get('status');
		status = rec ? rec.data.value : 'unknown';
		rec = s.data.get('qmpstatus');
		qmpstatus = rec ? rec.data.value : 'unknown';
		rec = s.data.get('template');
		if(rec.data.value){
		    template = rec.data.value;
		}
		spice = s.data.get('spice') ? true : false;

	    }

	    if (qmpstatus === 'prelaunch' || qmpstatus === 'paused') {
		startBtn.setVisible(false);
		resumeBtn.setVisible(true);
	    } else {
		startBtn.setVisible(true);
		resumeBtn.setVisible(false);
	    }
	    
	    spiceBtn.setVisible(spice);

	    spiceBtn.setDisabled(!caps.vms['VM.Console'] || status !== 'running');
	    startBtn.setDisabled(!caps.vms['VM.PowerMgmt'] || status === 'running' || template);
	    resetBtn.setDisabled(!caps.vms['VM.PowerMgmt'] || status !== 'running' || template);
	    shutdownBtn.setDisabled(!caps.vms['VM.PowerMgmt'] || status !== 'running');
	    stopBtn.setDisabled(!caps.vms['VM.PowerMgmt'] || status === 'stopped');
	    removeBtn.setDisabled(!caps.vms['VM.Allocate'] || status !== 'stopped');
	});

	me.on('afterrender', function() {
	    me.statusStore.startUpdate();
	});

	me.on('destroy', function() {
	    me.statusStore.stopUpdate();
	});
   }
});
// fixme: howto avoid jslint type confusion?
/*jslint confusion: true */
Ext.define('PVE.qemu.CreateWizard', {
    extend: 'PVE.window.Wizard',

    initComponent: function() {
	var me = this;

	var summarystore = Ext.create('Ext.data.Store', {
	    model: 'KeyValue',
	    sorters: [
		{
		    property : 'key',
		    direction: 'ASC'
		}
	    ]
	});

	var cdpanel = Ext.create('PVE.qemu.CDInputPanel', {
	    title: 'CD/DVD',
	    confid: 'ide2',
	    fieldDefaults: {
		labelWidth: 160
	    },
	    insideWizard: true
	});

	var hdpanel = Ext.create('PVE.qemu.HDInputPanel', {
	    title: gettext('Hard Disk'),
	    create: true,
	    insideWizard: true
	});

	var networkpanel =  Ext.create('PVE.qemu.NetworkInputPanel', {
	    title: gettext('Network'),
	    insideWizard: true
	});

	Ext.applyIf(me, {
	    subject: gettext('Virtual Machine'),
	    items: [
		{
		    xtype: 'inputpanel',
		    title: gettext('General'),
		    column1: [
			{
			    xtype: 'PVE.form.NodeSelector',
			    name: 'nodename',
			    selectCurNode: true,
			    fieldLabel: gettext('Node'),
			    allowBlank: false,
			    onlineValidator: true,
			    listeners: {
				change: function(f, value) {
				    networkpanel.setNodename(value);
				    hdpanel.setNodename(value);
				    cdpanel.setNodename(value);
				}
			    }
			},
			{
			    xtype: 'pveVMIDSelector',
			    name: 'vmid',
			    value: '',
			    loadNextFreeVMID: true,
			    validateExists: false
			},
			{
			    xtype: 'textfield',
			    name: 'name',
			    vtype: 'DnsName',
			    value: '',
			    fieldLabel: gettext('Name'),
			    allowBlank: true
			}
		    ],
		    column2: [
			{
			    xtype: 'pvePoolSelector',
			    fieldLabel: gettext('Resource Pool'),
			    name: 'pool',
			    value: '',
			    allowBlank: true
			}
		    ],
		    onGetValues: function(values) {
			if (!values.name) {
			    delete values.name;
			}
			if (!values.pool) {
			    delete values.pool;
			}
			return values;
		    }
		},
		{
		    title: 'OS',
		    xtype: 'PVE.qemu.OSTypeInputPanel'
		},
		cdpanel,
		hdpanel,
		{
		    xtype: 'PVE.qemu.ProcessorInputPanel',
		    title: 'CPU'
		},
		{
		    xtype: 'PVE.qemu.MemoryInputPanel',
		    insideWizard: true,
		    title: gettext('Memory')
		},
		networkpanel,
		{
		    title: gettext('Confirm'),
		    layout: 'fit',
		    items: [
			{
			    title: gettext('Settings'),
			    xtype: 'grid',
			    store: summarystore,
			    columns: [
				{header: 'Key', width: 150, dataIndex: 'key'},
				{header: 'Value', flex: 1, dataIndex: 'value'}
			    ]
			}
		    ],
		    listeners: {
			show: function(panel) {
			    var form = me.down('form').getForm();
			    var kv = me.getValues();
			    var data = [];
			    Ext.Object.each(kv, function(key, value) {
				if (key === 'delete') { // ignore
				    return;
				}
				var html = Ext.htmlEncode(Ext.JSON.encode(value));
				data.push({ key: key, value: value });
			    });
			    summarystore.suspendEvents();
			    summarystore.removeAll();
			    summarystore.add(data);
			    summarystore.sort();
			    summarystore.resumeEvents();
			    summarystore.fireEvent('datachanged', summarystore);

			}
		    },
		    onSubmit: function() {
			var kv = me.getValues();
			delete kv['delete'];

			var nodename = kv.nodename;
			delete kv.nodename;

			PVE.Utils.API2Request({
			    url: '/nodes/' + nodename + '/qemu',
			    waitMsgTarget: me,
			    method: 'POST',
			    params: kv,
			    success: function(response){
				me.close();
			    },
			    failure: function(response, opts) {
				Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			    }
			});
		    }
		}
	    ]
	});

	me.callParent();
    }
});




Ext.define('PVE.openvz.StatusView', {
    extend: 'PVE.grid.ObjectGrid',

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var render_cpu = function(value, metaData, record, rowIndex, colIndex, store) {
	    if (!me.getObjectValue('uptime')) {
		return '-';
	    }

	    var maxcpu = me.getObjectValue('cpus', 1);

	    if (!(Ext.isNumeric(value) && Ext.isNumeric(maxcpu) && (maxcpu >= 1))) {
		return '-';
	    }

	    var cpu = value * 100;
	    return cpu.toFixed(1) + '% of ' + maxcpu.toString() + (maxcpu > 1 ? 'CPUs' : 'CPU');

	};

	var render_mem = function(value, metaData, record, rowIndex, colIndex, store) {
	    var maxmem = me.getObjectValue('maxmem', 0);
	    var per = (value / maxmem)*100;
	    var text = "<div>Total: " + PVE.Utils.format_size(maxmem) + "</div>" + 
		"<div>Used: " + PVE.Utils.format_size(value) + "</div>";
	    return text;
	};

	var render_swap = function(value, metaData, record, rowIndex, colIndex, store) {
	    var maxswap = me.getObjectValue('maxswap', 0);
	    var per = (value / maxswap)*100;
	    var text = "<div>Total: " + PVE.Utils.format_size(maxswap) + "</div>" + 
		"<div>Used: " + PVE.Utils.format_size(value) + "</div>";
	    return text;
	};

	var render_status = function(value, metaData, record, rowIndex, colIndex, store) {
	    var failcnt = me.getObjectValue('failcnt', 0);
	    if (failcnt > 0) {
		return value + " (failure count " + failcnt.toString() + ")";
	    }
	    return value;
	};

	var rows = {
	    name: { header: gettext('Name'), defaultValue: 'no name specified' },
	    status: { header: gettext('Status'), defaultValue: 'unknown', renderer: render_status },
	    failcnt: { visible: false },
	    cpu: { header: 'CPU usage', required: true,  renderer: render_cpu },
	    cpus: { visible: false },
	    mem: { header: 'Memory usage', required: true,  renderer: render_mem },
	    maxmem: { visible: false },
	    swap: { header: 'VSwap usage', required: true,  renderer: render_swap },
	    maxswap: { visible: false },
	    uptime: { header: gettext('Uptime'), required: true, renderer: PVE.Utils.render_uptime },
	    ha: { header: 'Managed by HA', required: true, renderer: PVE.Utils.format_boolean }
	};

	Ext.applyIf(me, {
	    cwidth1: 150,
	    height: 200,
	    rows: rows
	});

	me.callParent();
    }
});
Ext.define('PVE.openvz.Summary', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pveOpenVZSummary',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	if (!me.workspace) {
	    throw "no workspace specified";
	}

	if (!me.statusStore) {
	    throw "no status storage specified";
	}

	var rstore = me.statusStore;

	var statusview = Ext.create('PVE.openvz.StatusView', {
	    title: 'Status',
	    pveSelNode: me.pveSelNode,
	    width: 400,
	    rstore: rstore
	});

	var rrdurl = "/api2/png/nodes/" + nodename + "/openvz/" + vmid + "/rrd";

	var notesview = Ext.create('PVE.panel.NotesView', {
	    pveSelNode: me.pveSelNode,
	    flex: 1
	});

	Ext.apply(me, {
	    tbar: [
		'->',
		{
		    xtype: 'pveRRDTypeSelector'
		}
	    ],
	    autoScroll: true,
	    bodyStyle: 'padding:10px',
	    defaults: {
		style: 'padding-top:10px',
		width: 800
	    },		
	    items: [
		{
		    style: 'padding-top:0px',
		    layout: {
			type: 'hbox',
			align: 'stretchmax'
		    },
		    border: false,
		    items: [ statusview, notesview ]
		},
		{
		    xtype: 'pveRRDView',
		    title: "CPU usage %",
		    pveSelNode: me.pveSelNode,
		    datasource: 'cpu',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Memory usage",
		    pveSelNode: me.pveSelNode,
		    datasource: 'mem,maxmem',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Network traffic",
		    pveSelNode: me.pveSelNode,
		    datasource: 'netin,netout',
		    rrdurl: rrdurl
		},
		{
		    xtype: 'pveRRDView',
		    title: "Disk IO",
		    pveSelNode: me.pveSelNode,
		    datasource: 'diskread,diskwrite',
		    rrdurl: rrdurl
		}
	    ]
	});

	me.on('show', function() {
	    notesview.load();
	});

	me.callParent();
    }
});
Ext.define('PVE.openvz.RessourceInputPanel', {
    extend: 'PVE.panel.InputPanel',
    alias: 'widget.pveOpenVZResourceInputPanel',

    insideWizard: false,

    initComponent : function() {
	var me = this;

	var labelWidth = 120;

	me.column1 = [
	    {
		xtype: 'numberfield',
		name: 'memory',
		minValue: 32,
		maxValue: 512*1024,
		value: '512',
		step: 32,
		fieldLabel: gettext('Memory') + ' (MB)',
		labelWidth: labelWidth,
		allowBlank: false
	    },
	    {
		xtype: 'numberfield',
		name: 'swap',
		minValue: 0,
		maxValue: 128*1024,
		value: '512',
		step: 32,
		fieldLabel: gettext('Swap') + ' (MB)',
		labelWidth: labelWidth,
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'numberfield',
		name: 'disk',
		minValue: 0.001,
		maxValue: 128*1024,
		decimalPrecision: 3,
		value: '4',
		step: 1,
		fieldLabel: gettext('Disk size') + ' (GB)',
		labelWidth: labelWidth,
		allowBlank: false
	    },
	    {
		xtype: 'numberfield',
		name: 'cpus',
		minValue: 1,
		value: '1',
		step: 1,
		fieldLabel: 'CPUs',
		labelWidth: labelWidth,
		allowBlank: false
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.openvz.RessourceEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
	
	Ext.apply(me, {
	    subject: gettext('Resources'),
	    items: Ext.create('PVE.openvz.RessourceInputPanel')
	});

	me.callParent();

	me.load();
    }
});// fixme: howto avoid jslint type confusion?
/*jslint confusion: true */
Ext.define('PVE.openvz.RessourceView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveOpenVZRessourceView'],

    initComponent : function() {
	var me = this;
	var i, confid;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) { 
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	var resEditor = (caps.vms['VM.Config.Memory'] || caps.vms['VM.Config.Disk'] ||
		      caps.vms['VM.Config.CPU']) ? 'PVE.openvz.RessourceEdit' : undefined;


	var rows = {
	    memory: {
		header: gettext('Memory'),
		editor: resEditor,
		never_delete: true,
		renderer: function(value) {
		    return PVE.Utils.format_size(value*1024*1024);
		}
	    },
	    swap: {
		header: gettext('Swap'),
		editor: resEditor,
		never_delete: true,
		renderer: function(value) {
		    return PVE.Utils.format_size(value*1024*1024);
		}
	    },
	    cpus: {
		header: gettext('Processors'),
		never_delete: true,
		editor: resEditor,
		defaultValue: 1
	    },
	    disk: {
		header: gettext('Disk size'),
		editor: resEditor,
		never_delete: true,
		renderer: function(value) {
		    return PVE.Utils.format_size(value*1024*1024*1024);
		}
	    }
	};

	var reload = function() {
	    me.rstore.load();
	};

	var baseurl = 'nodes/' + nodename + '/openvz/' + vmid + '/config';

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var editor = rowdef.editor;

	    var win = Ext.create(editor, {
		pveSelNode: me.pveSelNode,
		confid: rec.data.key,
		url: '/api2/extjs/' + baseurl
	    });

	    win.show();
	    win.on('destroy', reload);
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    selModel: sm,
	    disabled: true,
	    enableFn: function(rec) {
		if (!rec) {
		    return false;
		}
		var rowdef = rows[rec.data.key];
		return !!rowdef.editor;
	    },
	    handler: run_editor
	});

	Ext.applyIf(me, {
	    url: '/api2/json/' + baseurl,
	    selModel: sm,
	    cwidth1: 170,
	    tbar: [ edit_btn ],
	    rows: rows,
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
/*jslint confusion: true */
Ext.define('PVE.openvz.Options', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveOpenVZOptions'],

    initComponent : function() {
	var me = this;
	var i;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	var rows = {
	    onboot: {
		header: gettext('Start at boot'),
		defaultValue: '',
		renderer: PVE.Utils.format_boolean,
		editor: caps.vms['VM.Config.Options'] ? {
		    xtype: 'pveWindowEdit',
		    subject: gettext('Start at boot'),
		    items: {
			xtype: 'pvecheckbox',
			name: 'onboot',
			uncheckedValue: 0,
			defaultValue: 0,
			fieldLabel: gettext('Start at boot')
		    }
		} : undefined
	    },
	    ostemplate: {
		header: gettext('Template'),
		defaultValue: 'no set'
	    },
	    storage: {
		header: gettext('Storage'),
		defaultValue: 'no set'
	    },
	    cpuunits: {
		header: 'CPU units',
		defaultValue: '1000',
		editor: caps.vms['VM.Config.CPU'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'CPU units',
		    items: {
			xtype: 'numberfield',
			name: 'cpuunits',
			fieldLabel: 'CPU units',
			minValue: 8,
			maxValue: 500000,
			allowBlank: false
		    }
		} : undefined
	    },
	    quotaugidlimit: {
		header: 'Quota UGID limit',
		defaultValue: '0',
		renderer: function(value) {
		    if (value == 0) {
			return 'User quotas disabled.';
		    }
		    return value;
		},
		editor: caps.vms['VM.Config.Disk'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'Quota UGID limit (0 to disable user quotas)',
		    items: {
			xtype: 'numberfield',
			name: 'quotaugidlimit',
			fieldLabel: 'UGID limit',
			minValue: 0,
			allowBlank: false
		    }
		} : undefined
	    },
	    quotatime: {
		header: 'Quota Grace period',
		defaultValue: '0',
		editor: caps.vms['VM.Config.Disk'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'Quota Grace period (seconds)',
		    items: {
			xtype: 'numberfield',
			name: 'quotatime',
			minValue: 0,
			allowBlank: false,
			fieldLabel: 'Grace period'
		    }
		} : undefined
	    }
	};

	var baseurl = 'nodes/' + nodename + '/openvz/' + vmid + '/config';

	var reload = function() {
	    me.rstore.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var config = Ext.apply({
		pveSelNode: me.pveSelNode,
		confid: rec.data.key,
		url: '/api2/extjs/' + baseurl
	    }, rowdef.editor);
	    var win = Ext.createWidget(rowdef.editor.xtype, config);
	    win.load();

	    win.show();
	    win.on('destroy', reload);
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    enableFn: function(rec) {
		var rowdef = rows[rec.data.key];
		return !!rowdef.editor;
	    },
	    handler: run_editor
	});

	Ext.applyIf(me, {
	    url: "/api2/json/nodes/" + nodename + "/openvz/" + vmid + "/config",
	    selModel: sm,
	    cwidth1: 150,
	    tbar: [ edit_btn ],
	    rows: rows,
	    listeners: {
		itemdblclick: run_editor
	    }
	});

	me.callParent();

	me.on('show', reload);
    }
});

/*jslint confusion: true */
Ext.define('PVE.OpenVZ.NetIfEdit', {
    extend: 'PVE.window.Edit',

    isAdd: true,

    getValues: function() {
	var me = this;

	var values = me.formPanel.getValues();

	if (!me.create) {
	    values.ifname = me.ifname;
	}

	var newdata = Ext.clone(me.netif);
	newdata[values.ifname] = values;
	return { netif: PVE.Parser.printOpenVZNetIf(newdata) };
    },

    initComponent : function() {
	var me = this;

	if (!me.dataCache) {
	    throw "no dataCache specified";
	}

	if (!me.nodename) {
	    throw "no node name specified";
	}
	
	me.netif = PVE.Parser.parseOpenVZNetIf(me.dataCache.netif) || {};

	var cdata = {};

	if (!me.create) {
	    if (!me.ifname) {
		throw "no interface name specified";
	    }
	    cdata = me.netif[me.ifname];
	    if (!cdata) {
		throw "no such interface '" + me.ifname + "'";
	    }
	}

	Ext.apply(me, {
	    subject: gettext('Network Device') + ' (veth)',
	    digest: me.dataCache.digest,
	    width: 350,
	    fieldDefaults: {
		labelWidth: 130
	    },
	    items: [
		{
		    xtype: me.create ? 'textfield' : 'displayfield',
		    name: 'ifname',
		    height: 22, // hack: set same height as text fields
		    fieldLabel: gettext('Name') + ' (i.e. eth0)',
		    allowBlank: false,
		    value: cdata.ifname,
		    validator: function(value) {
			if (me.create && me.netif[value]) {
			    return "interface name already in use";
			}
			return true;
		    }
		},
		{
		    xtype: 'textfield',
		    name: 'mac',
		    fieldLabel: 'MAC',
		    vtype: 'MacAddress',
		    value: cdata.mac,
		    allowBlank: me.create,
		    emptyText: 'auto'
		},
		{
		    xtype: 'PVE.form.BridgeSelector',
		    name: 'bridge',
		    nodename: me.nodename,
		    fieldLabel: 'Bridge',
		    value: cdata.bridge,
		    allowBlank: false
		},
		{
		    xtype: 'textfield',
		    name: 'host_ifname',
		    fieldLabel: 'Host device name',
		    value: cdata.host_ifname,
		    allowBlank: true,
		    emptyText: 'auto'
		},
		{
		    xtype: 'textfield',
		    name: 'host_mac',
		    fieldLabel: 'Host MAC address',
		    vtype: 'MacAddress',
		    value: cdata.host_mac,
		    allowBlank: true,
		    emptyText: 'auto'
		}
	    ]
	});

	me.callParent();
    }
});

Ext.define('PVE.OpenVZ.IPAdd', {
    extend: 'PVE.window.Edit',

    isAdd: true,

    create: true, 

    getValues: function() {
	var me = this;

	var values = me.formPanel.getValues();

	if (me.dataCache.ip_address) {
	    return { ip_address: me.dataCache.ip_address + ' ' + values.ipaddress };
	} else {  
	    return { ip_address: values.ipaddress };
	}
    },

    initComponent : function() {
	var me = this;

	if (!me.dataCache) {
	    throw "no dataCache specified";
	}

	Ext.apply(me, {
	    subject: gettext('IP address') + ' (venet)',
	    digest: me.dataCache.digest,
	    width: 350,
	    items: {
		xtype: 'textfield',
		name: 'ipaddress',
		fieldLabel: gettext('IP address'),
		vtype: 'IPAddress',
		allowBlank: false
	    }
	});

	me.callParent();
    }
});


Ext.define('PVE.openvz.NetworkView', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveOpenVZNetworkView'],

    dataCache: {}, // used to store result of last load

    ipAddressText: gettext('IP address'),
    networkText: gettext('Network'),
    networkDeviceText: gettext('Network Device'),

    renderType: function(value, metaData, record, rowIndex, colIndex, store) {
	var me = this;
	if (value === 'ip') {
	    return me.ipAddressText;
	} else if (value === 'net') {
	    return me.networkText;
	} else if (value === 'veth') {
	    return me.networkDeviceText;
	} else {
	    return value;
	}
    },

    renderValue: function(value, metaData, record, rowIndex, colIndex, store) {
	var type = record.data.type;
	if (type === 'veth') {
	    return record.data.ifname;
	} else {
	    return value;
	}
    },

    load: function() {
	var me = this;

	PVE.Utils.setErrorMask(me, true);

	PVE.Utils.API2Request({
	    url: me.url,
	    failure: function(response, opts) {
		PVE.Utils.setErrorMask(me, gettext('Error') + ': ' + response.htmlStatus);
	    },
	    success: function(response, opts) {
		PVE.Utils.setErrorMask(me, false);
		var result = Ext.decode(response.responseText);
		var data = result.data || {};
		me.dataCache = data;
		var ipAddress = data.ip_address;
		var records = [];
		if (ipAddress) {
		    var ind = 0;
		    Ext.Array.each(ipAddress.split(' '), function(value) {
			if (value) {
			    records.push({
				type: 'ip',
				id: 'ip' + ind,
				value: value
			    });
			    ind++;
			}
		    });
		}
		var netif = PVE.Parser.parseOpenVZNetIf(me.dataCache.netif);
		if (netif) {
		    Ext.Object.each(netif, function(iface, data) {
			
			records.push(Ext.apply({
			    type: 'veth',
			    id: iface,
			    value: data.raw
			}, data));
		    });
		}
		me.store.loadData(records);
	    }
	});
    },

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	me.url = '/nodes/' + nodename + '/openvz/' + vmid + '/config';

	var store = new Ext.data.Store({
	    model: 'pve-openvz-network'
	});

	var sm = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    enableFn: function(rec) {
		return !!caps.vms['VM.Config.Network'];
	    },
	    confirmMsg: function (rec) {
		var idtext = rec.id;
		if (rec.data.type === 'ip') {
		    idtext = rec.data.value;
		} else if (rec.data.type === 'veth') {
		    idtext = rec.data.id;
		}
		return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					 "'" + idtext + "'");
	    },
	    handler: function(btn, event, rec) {
		var values = { digest: me.dataCache.digest };

		if (rec.data.type === 'ip') {
		    var ipa = [];
		    Ext.Array.each(me.dataCache.ip_address.split(' '), function(value) {
			if (value && value !== rec.data.value) {
			    ipa.push(value);
			}
		    });
		    values.ip_address = ipa.join(' ');
		} else if (rec.data.type === 'veth') {
		    var netif = PVE.Parser.parseOpenVZNetIf(me.dataCache.netif);
		    delete netif[rec.data.id];
		    values.netif = PVE.Parser.printOpenVZNetIf(netif);
		} else {
		    return; // not implemented
		}

		PVE.Utils.API2Request({
		    url: me.url,
		    waitMsgTarget: me,
		    method: 'PUT',
		    params: values,
		    callback: function() {
			me.load();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec || rec.data.type !== 'veth') {
		return;
	    }

	    if (!caps.vms['VM.Config.Network']) {
		return false;
	    }

	    var win = Ext.create('PVE.OpenVZ.NetIfEdit', {
		url: me.url,
		nodename: nodename,
		dataCache: me.dataCache,
		ifname: rec.data.id
	    });
	    win.on('destroy', me.load, me);
	    win.show();
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    selModel: sm,
	    disabled: true,
	    enableFn: function(rec) {
		if (!caps.vms['VM.Config.Network']) {
		    return false;
		}
		return rec.data.type === 'veth';
	    },
	    handler: run_editor
	});


	Ext.applyIf(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    tbar: [
		{
		    text: gettext('Add'),
		    menu: new Ext.menu.Menu({
			items: [
			    {
				text: gettext('IP address') + ' (venet)',
				disabled: !caps.vms['VM.Config.Network'],
				//plain: true,
				//iconCls: 'pve-itype-icon-storage',
				handler: function() {
				    var win = Ext.create('PVE.OpenVZ.IPAdd', {
					url: me.url,
					dataCache: me.dataCache
				    });
				    win.on('destroy', me.load, me);
				    win.show();
				}
			    },
			    {
				text: gettext('Network Device') + ' (veth)',
				disabled: !caps.vms['VM.Config.Network'],
				//plain: true,
				//iconCls: 'pve-itype-icon-storage',
				handler: function() {
				    var win = Ext.create('PVE.OpenVZ.NetIfEdit', {
					url: me.url,
					nodename: nodename,
					create: true,
					dataCache: me.dataCache
				    });
				    win.on('destroy', me.load, me);
				    win.show();
				}
			    }
			]
		    })
		},
		remove_btn,
		edit_btn
	    ],
	    columns: [
		{
		    header: gettext('Type'),
		    width: 110,
		    dataIndex: 'type',
		    renderer: me.renderType
		},
		{
		    header: gettext('IP address') +'/' + gettext('Name'),
		    width: 110,
		    dataIndex: 'value',
		    renderer: me.renderValue
		},
		{
		    header: 'Bridge',
		    width: 110,
		    dataIndex: 'bridge'
		},
		{
		    header: 'MAC',
		    width: 110,
		    dataIndex: 'mac'
		},
		{
		    header: 'Host ifname',
		    width: 110,
		    dataIndex: 'host_ifname'
		},
		{
		    header: 'Host MAC',
		    width: 110,
		    dataIndex: 'host_mac'
		}
	    ],
	    listeners: {
		show: me.load,
		itemdblclick: run_editor
	    }
	});

	me.callParent();

	me.load();
   }
}, function() {

    Ext.define('pve-openvz-network', {
	extend: "Ext.data.Model",
	proxy: { type: 'memory' },
	fields: [ 'id', 'type', 'value', 'ifname', 'mac', 'bridge', 'host_ifname', 'host_mac' ]
    });

});

/*jslint confusion: true */
Ext.define('PVE.openvz.DNS', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveOpenVZDNS'],

    initComponent : function() {
	var me = this;
	var i;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	var rows = {
	    hostname: {
		required: true,
		defaultValue: me.pveSelNode.data.name,
		header: 'Hostname',
		editor: caps.vms['VM.Config.Network'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'Hostname',
		    items: {
			xtype: 'textfield',
			name: 'hostname',
			vtype: 'DnsName',
			value: '',
			fieldLabel: 'Hostname',
			allowBlank: true,
			emptyText: me.pveSelNode.data.name
		    }
		} : undefined
	    },
	    searchdomain: {
		header: 'DNS domain',
		defaultValue: '',
		editor: caps.vms['VM.Config.Network'] ? {
		    xtype: 'pveWindowEdit',
		    subject: 'DNS domain',
		    items: {
			xtype: 'pvetextfield',
			name: 'searchdomain',
			fieldLabel: 'DNS domain',
			allowBlank: false
		    }
		} : undefined
	    },
	    nameserver: {
		header: gettext('DNS server'),
		defaultValue: '',
		editor: caps.vms['VM.Config.Network'] ? {
		    xtype: 'pveWindowEdit',
		    subject: gettext('DNS server'),
		    items: {
			xtype: 'pvetextfield',
			name: 'nameserver',
			fieldLabel: gettext('DNS server'),
			allowBlank: false
		    }
		} : undefined
	    }
	};

	var baseurl = 'nodes/' + nodename + '/openvz/' + vmid + '/config';

	var reload = function() {
	    me.rstore.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var config = Ext.apply({
		pveSelNode: me.pveSelNode,
		confid: rec.data.key,
		url: '/api2/extjs/' + baseurl
	    }, rowdef.editor);
	    var win = Ext.createWidget(rowdef.editor.xtype, config);
	    win.load();

	    win.show();
	    win.on('destroy', reload);
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    enableFn: function(rec) {
		var rowdef = rows[rec.data.key];
		return !!rowdef.editor;
	    },
	    handler: run_editor
	});

	var set_button_status = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];

	    if (!rec) {
		edit_btn.disable();
		return;
	    }
	    var rowdef = rows[rec.data.key];
	    edit_btn.setDisabled(!rowdef.editor);
	};

	Ext.applyIf(me, {
	    url: "/api2/json/nodes/" + nodename + "/openvz/" + vmid + "/config",
	    selModel: sm,
	    cwidth1: 150,
	    tbar: [ edit_btn ],
	    rows: rows,
	    listeners: {
		itemdblclick: run_editor,
		selectionchange: set_button_status
	    }
	});

	me.callParent();

	me.on('show', reload);
    }
});

/*jslint confusion: true */
Ext.define('PVE.openvz.BeanCounterGrid', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveBeanCounterGrid'],

    renderUbc: function(value, metaData, record, rowIndex, colIndex, store) {

	if (value === 9223372036854775807) {
	    return '-';
	}

	if (record.id.match(/pages$/)) {
	    return PVE.Utils.format_size(value*4096);
	}
	if (record.id.match(/(size|buf)$/)) {
	    return PVE.Utils.format_size(value);
	}

	return value;
    },

    initComponent : function() {
	var me = this;

	if (!me.url) {
	    throw "no url specified";
	}

	var store = new Ext.data.Store({
	    model: 'pve-openvz-ubc',
	    proxy: {
		type: 'pve',
		url: me.url
	    },
	    sorters: [
		{
		    property : 'id',
		    direction: 'ASC'
		}
	    ]
	});

	var reload = function() {
	    store.load();
	};

	Ext.applyIf(me, {
	    store: store,
	    stateful: false,
	    columns: [
		{
		    header: 'Ressource',
		    width: 100,
		    dataIndex: 'id'
		},
		{
		    header: 'held',
		    width: 100,
		    renderer: me.renderUbc,
		    dataIndex: 'held'
		},
		{
		    header: 'maxheld',
		    width: 100,
		    renderer: me.renderUbc,
		    dataIndex: 'maxheld'
		},
		{
		    header: 'barrier',
		    width: 100,
		    renderer: me.renderUbc,
		    dataIndex: 'bar'
		},
		{
		    header: 'limit',
		    width: 100,
		    renderer: me.renderUbc,
		    dataIndex: 'lim'
		},
		{
		    header: 'failcnt',
		    width: 100,
		    dataIndex: 'failcnt'
		}
	    ],
	    listeners: {
		show: reload
	    }
	});

	me.callParent();

   }
}, function() {

    Ext.define('pve-openvz-ubc', {
	extend: "Ext.data.Model",
	fields: [ 'id', 
		  { name: 'held', type: 'number' },
		  { name: 'maxheld', type: 'number' },
		  { name: 'bar', type: 'number' },
		  { name: 'lim', type: 'number' },
		  { name: 'failcnt', type: 'number' }
		]
    });

});
Ext.define('PVE.openvz.Config', {
    extend: 'PVE.panel.Config',
    alias: 'widget.PVE.openvz.Config',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	me.statusStore = Ext.create('PVE.data.ObjectStore', {
	    url: "/api2/json/nodes/" + nodename + "/openvz/" + vmid + "/status/current",
	    interval: 1000
	});

	var vm_command = function(cmd, params) {
	    PVE.Utils.API2Request({
		params: params,
		url: '/nodes/' + nodename + '/openvz/' + vmid + "/status/" + cmd,
		waitMsgTarget: me,
		method: 'POST',
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		}
	    });
	};

	var startBtn = Ext.create('Ext.Button', { 
	    text: gettext('Start'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    handler: function() {
		vm_command('start');
	    }			    
	}); 

	var umountBtn = Ext.create('Ext.Button', { 
	    text: gettext('Unmount'),
	    disabled: true,
	    hidden: true,
	    handler: function() {
		vm_command('umount');
	    }			    
	}); 
 
	var stopBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Stop'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    confirmMsg: Ext.String.format(gettext("Do you really want to stop VM {0}?"), vmid),
	    handler: function() {
		vm_command("stop");
	    }
	});
 
	var shutdownBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Shutdown'),
	    disabled: !caps.vms['VM.PowerMgmt'],
	    confirmMsg: Ext.String.format(gettext("Do you really want to shutdown VM {0}?"), vmid),
	    handler: function() {
		vm_command('shutdown');
	    }			    
	});
 
	var migrateBtn = Ext.create('Ext.Button', { 
	    text: gettext('Migrate'),
	    disabled: !caps.vms['VM.Migrate'],
	    handler: function() {
		var win = Ext.create('PVE.window.Migrate', { 
		    vmtype: 'openvz',
		    nodename: nodename,
		    vmid: vmid
		});
		win.show();
	    }
	});

	var removeBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Remove'),
	    disabled: !caps.vms['VM.Allocate'],
	    dangerous: true,
	    confirmMsg: Ext.String.format(gettext('Are you sure you want to remove VM {0}? This will permanently erase all VM data.'), vmid),
	    handler: function() {
		PVE.Utils.API2Request({
		    url: '/nodes/' + nodename + '/openvz/' + vmid,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    failure: function(response, opts) {
			Ext.Msg.alert('Error', response.htmlStatus);
		    }
		});
	    }
	});

	var vmname = me.pveSelNode.data.name;

	var consoleBtn = Ext.create('Ext.Button', {
	    text: gettext('Console'),
	    disabled: !caps.vms['VM.Console'],
	    handler: function() {
		PVE.Utils.openConoleWindow('openvz', vmid, nodename, vmname);
	    }
	});

	var descr = vmid + " (" + (vmname ? "'" + vmname + "' " : "'CT " + vmid + "'") + ")";

	Ext.apply(me, {
	    title: Ext.String.format(gettext("Container {0} on node {1}"), descr, "'" + nodename + "'"),
	    hstateid: 'ovztab',
	    tbar: [ startBtn, shutdownBtn, umountBtn, stopBtn, removeBtn, 
		    migrateBtn, consoleBtn ],
	    defaults: { statusStore: me.statusStore },
	    items: [
		{
		    title: gettext('Summary'),
		    xtype: 'pveOpenVZSummary',
		    itemId: 'summary'
		},
		{
		    title: gettext('Resources'),
		    itemId: 'resources',
		    xtype: 'pveOpenVZRessourceView'
		},
		{
		    title: gettext('Network'),
		    itemId: 'network',
		    xtype: 'pveOpenVZNetworkView'
		},
		{
		    title: 'DNS',
		    itemId: 'dns',
		    xtype: 'pveOpenVZDNS'
		},
		{
		    title: gettext('Options'),
		    itemId: 'options',
		    xtype: 'pveOpenVZOptions'
		},
		{
		    title: 'Task History',
		    itemId: 'tasks',
		    xtype: 'pveNodeTasks',
		    vmidFilter: vmid
		},
		{
		    title: 'UBC',
		    itemId: 'ubc',
		    xtype: 'pveBeanCounterGrid',
		    url: '/api2/json/nodes/' + nodename + '/openvz/' + vmid + '/status/ubc'
		}
	    ]
	});

	if (caps.vms['VM.Backup']) {
	    me.items.push({
		title: gettext('Backup'),
		xtype: 'pveBackupView',
		itemId: 'backup'
	    });
	}

	if (caps.vms['Permissions.Modify']) {
	    me.items.push({
		xtype: 'pveACLView',
		title: gettext('Permissions'),
		itemId: 'permissions',
		path: '/vms/' + vmid
	    });
	}

	me.callParent();

	me.statusStore.on('load', function(s, records, success) {
	    var status;
	    if (!success) {
		me.workspace.checkVmMigration(me.pveSelNode);
		status = 'unknown';
	    } else {
		var rec = s.data.get('status');
		status = rec ? rec.data.value : 'unknown';
	    }
	    startBtn.setDisabled(!caps.vms['VM.PowerMgmt'] || status === 'running');
	    shutdownBtn.setDisabled(!caps.vms['VM.PowerMgmt'] || status !== 'running');
	    stopBtn.setDisabled(!caps.vms['VM.PowerMgmt'] || status === 'stopped');
	    removeBtn.setDisabled(!caps.vms['VM.Allocate'] || status !== 'stopped');

	    if (status === 'mounted') {
		umountBtn.setDisabled(false);
		umountBtn.setVisible(true);
		stopBtn.setVisible(false);
	    } else {
		umountBtn.setDisabled(true);
		umountBtn.setVisible(false);
		stopBtn.setVisible(true);
	    }
	});

	me.on('afterrender', function() {
	    me.statusStore.startUpdate();
	});

	me.on('destroy', function() {
	    me.statusStore.stopUpdate();
	});
    }
});
/*jslint confusion: true */
Ext.define('PVE.openvz.CreateWizard', {
    extend: 'PVE.window.Wizard',

    initComponent: function() {
	var me = this;

	var summarystore = Ext.create('Ext.data.Store', {
	    model: 'KeyValue',
	    sorters: [
		{
		    property : 'key',
		    direction: 'ASC'
		}
	    ]
	});

	var storagesel = Ext.create('PVE.form.StorageSelector', {
	    name: 'storage',
	    fieldLabel: gettext('Storage'),
	    storageContent: 'rootdir',
	    autoSelect: true,
	    allowBlank: false
	});

	var tmplsel = Ext.create('PVE.form.FileSelector', {
	    name: 'ostemplate',
	    storageContent: 'vztmpl',
	    fieldLabel: gettext('Template'),
	    allowBlank: false
	});

	var tmplstoragesel = Ext.create('PVE.form.StorageSelector', {
	    name: 'tmplstorage',
	    fieldLabel: gettext('Storage'),
	    storageContent: 'vztmpl',
	    autoSelect: true,
	    allowBlank: false,
	    listeners: {
		change: function(f, value) {
		    tmplsel.setStorage(value);
		}
	    }
	});

	var bridgesel = Ext.create('PVE.form.BridgeSelector', {
	    name: 'bridge',
	    fieldLabel: 'Bridge',
	    labelAlign: 'right',
	    autoSelect: true,
	    disabled: true,
	    allowBlank: false
	});

	Ext.applyIf(me, {
	    subject: gettext('OpenVZ Container'),
	    items: [
		{
		    xtype: 'inputpanel',
		    title: gettext('General'),
		    column1: [
			{
			    xtype: 'PVE.form.NodeSelector',
			    name: 'nodename',
			    fieldLabel: gettext('Node'),
			    allowBlank: false,
			    onlineValidator: true,
			    listeners: {
				change: function(f, value) {
				    tmplstoragesel.setNodename(value);
				    tmplsel.setStorage(undefined, value);
				    bridgesel.setNodename(value);
				    storagesel.setNodename(value);
				}
			    }
			},
			{
			    xtype: 'pveVMIDSelector',
			    name: 'vmid',
			    value: '',
			    loadNextFreeVMID: true,
			    validateExists: false
			},
			{
			    xtype: 'pvetextfield',
			    name: 'hostname',
			    vtype: 'DnsName',
			    value: '',
			    fieldLabel: 'Hostname',
			    skipEmptyText: true,
			    allowBlank: true
			}
		    ],
		    column2: [
			{
			    xtype: 'pvePoolSelector',
			    fieldLabel: gettext('Resource Pool'),
			    name: 'pool',
			    value: '',
			    allowBlank: true
			},
			storagesel,
			{
			    xtype: 'textfield',
			    inputType: 'password',
			    name: 'password',
			    value: '',
			    fieldLabel: gettext('Password'),
			    allowBlank: false,
			    minLength: 5,
			    change: function(f, value) {
				if (!me.rendered) {
				    return;
				}
				me.down('field[name=confirmpw]').validate();
			    }
			},
			{
			    xtype: 'textfield',
			    inputType: 'password',
			    name: 'confirmpw',
			    value: '',
			    fieldLabel: gettext('Confirm password'),
			    allowBlank: false,
			    validator: function(value) {
				var pw = me.down('field[name=password]').getValue();
				if (pw !== value) {
				    return "Passwords does not match!";
				}
				return true;
			    }
			}
		    ],
		    onGetValues: function(values) {
			delete values.confirmpw;
			if (!values.pool) {
			    delete values.pool;
			}
			return values;
		    }
		},
		{
		    xtype: 'inputpanel',
		    title: gettext('Template'),
		    column1: [ tmplstoragesel, tmplsel]
		},
		{
		    xtype: 'pveOpenVZResourceInputPanel',
		    title: gettext('Resources')
		},
		{
		    xtype: 'inputpanel',
		    title: gettext('Network'),
		    column1: [
			{
			    xtype: 'radiofield',
			    name: 'networkmode',
			    inputValue: 'routed',
			    boxLabel: 'Routed mode (venet)',
			    checked: true,
			    listeners: {
				change: function(f, value) {
				    if (!me.rendered) {
					return;
				    }
				    me.down('field[name=ip_address]').setDisabled(!value);
				    me.down('field[name=ip_address]').validate();
				}
			    }
			},
			{
			    xtype: 'textfield',
			    name: 'ip_address',
			    vtype: 'IPAddress',
			    value: '',
			    fieldLabel: gettext('IP address'),
			    labelAlign: 'right',
			    allowBlank: false
			}
		    ],
		    column2: [
			{
			    xtype: 'radiofield',
			    name: 'networkmode',
			    inputValue: 'bridge',
			    boxLabel: 'Bridged mode',
			    checked: false,
			    listeners: {
				change: function(f, value) {
				    if (!me.rendered) {
					return;
				    }
				    me.down('field[name=bridge]').setDisabled(!value);
				    me.down('field[name=bridge]').validate();
				}
			    }
			},
			bridgesel
		    ],
		    onGetValues: function(values) {
			if (values.networkmode === 'bridge') {
			    return { netif: 'ifname=eth0,bridge=' + values.bridge };
			} else {
			    return { ip_address: values.ip_address };
			}
		    }
		},
		{
		    xtype: 'inputpanel',
		    title: 'DNS',
		    column1: [
			{
			    xtype: 'pvetextfield',
			    name: 'searchdomain',
			    skipEmptyText: true,
			    fieldLabel: 'DNS domain',
			    emptyText: 'use host settings',
			    allowBlank: true,
			    listeners: {
				change: function(f, value) {
				    if (!me.rendered) {
					return;
				    }
				    var field = me.down('#dns1');
				    field.setDisabled(!value);
				    field.clearInvalid();
				    field = me.down('#dns2');
				    field.setDisabled(!value);
				    field.clearInvalid();
				}
			    }
			},
			{
			    xtype: 'pvetextfield',
			    fieldLabel: gettext('DNS server') + " 1",
			    vtype: 'IPAddress',
			    allowBlank: true,
			    disabled: true,
			    name: 'nameserver',
			    itemId: 'dns1'
			},
			{
			    xtype: 'pvetextfield',
			    fieldLabel: gettext('DNS server') + " 2",
			    vtype: 'IPAddress',
			    skipEmptyText: true,
			    disabled: true,
			    name: 'nameserver',
			    itemId: 'dns2'
			}
		    ]
		},
		{
		    title: gettext('Confirm'),
		    layout: 'fit',
		    items: [
			{
			    title: gettext('Settings'),
			    xtype: 'grid',
			    store: summarystore,
			    columns: [
				{header: 'Key', width: 150, dataIndex: 'key'},
				{header: 'Value', flex: 1, dataIndex: 'value'}
			    ]
			}
		    ],
		    listeners: {
			show: function(panel) {
			    var form = me.down('form').getForm();
			    var kv = me.getValues();
			    var data = [];
			    Ext.Object.each(kv, function(key, value) {
				if (key === 'delete' || key === 'tmplstorage') { // ignore
				    return;
				}
				if (key === 'password') { // don't show pw
				    return;
				}
				var html = Ext.htmlEncode(Ext.JSON.encode(value));
				data.push({ key: key, value: value });
			    });
			    summarystore.suspendEvents();
			    summarystore.removeAll();
			    summarystore.add(data);
			    summarystore.sort();
			    summarystore.resumeEvents();
			    summarystore.fireEvent('datachanged', summarystore);
			}
		    },
		    onSubmit: function() {
			var kv = me.getValues();
			delete kv['delete'];

			var nodename = kv.nodename;
			delete kv.nodename;
			delete kv.tmplstorage;

			PVE.Utils.API2Request({
			    url: '/nodes/' + nodename + '/openvz',
			    waitMsgTarget: me,
			    method: 'POST',
			    params: kv,
			    success: function(response, opts){
				var upid = response.result.data;
		    
				var win = Ext.create('PVE.window.TaskViewer', { 
				    upid: upid
				});
				win.show();
				me.close();
			    },
			    failure: function(response, opts) {
				Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			    }
			});
		    }
		}
	    ]
	});

	me.callParent();
    }
});



Ext.define('PVE.pool.StatusView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pvePoolStatusView'],

    initComponent : function() {
	var me = this;

	var pool = me.pveSelNode.data.pool;
	if (!pool) {
	    throw "no pool specified";
	}

	var rows = {
	    comment: {
		header: gettext('Comment'), 
		required: true
	    }
	};

	Ext.applyIf(me, {
	    title: gettext('Status'),
	    url: "/api2/json/pools/" + pool,
	    cwidth1: 150,
	    interval: 30000,
	    //height: 195,
	    rows: rows
	});

	me.callParent();
    }
});
Ext.define('PVE.pool.Summary', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pvePoolSummary',

    initComponent: function() {
        var me = this;

	var pool = me.pveSelNode.data.pool;
	if (!pool) {
	    throw "no pool specified";
	}

	var statusview = Ext.create('PVE.pool.StatusView', {
	    pveSelNode: me.pveSelNode,
	    style: 'padding-top:0px'
	});

	var rstore = statusview.rstore;

	Ext.apply(me, {
	    autoScroll: true,
	    bodyStyle: 'padding:10px',
	    defaults: {
		style: 'padding-top:10px',
		width: 800
	    },
	    items: [ statusview ]
	});

	me.on('show', rstore.startUpdate);
	me.on('hide', rstore.stopUpdate);
	me.on('destroy', rstore.stopUpdate);	

	me.callParent();
    }
});
Ext.define('PVE.pool.Config', {
    extend: 'PVE.panel.Config',
    alias: 'widget.pvePoolConfig',

    initComponent: function() {
        var me = this;

	var pool = me.pveSelNode.data.pool;
	if (!pool) {
	    throw "no pool specified";
	}

	Ext.apply(me, {
	    title: Ext.String.format(gettext("Resource Pool") + ': ' + pool),
	    hstateid: 'pooltab',
	    items: [
		{
		    title: gettext('Summary'),
		    xtype: 'pvePoolSummary',
		    itemId: 'summary'
		},
		{
		    title: gettext('Members'),
		    xtype: 'pvePoolMembers',
		    pool: pool,
		    itemId: 'members'
		},
		{
		    xtype: 'pveACLView',
		    title: gettext('Permissions'),
		    itemId: 'permissions',
		    path: '/pool/' + pool
		}
	    ]
	});

	me.callParent();
   }
});
Ext.define('PVE.grid.TemplateSelector', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveTemplateSelector'],

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	var baseurl = "/nodes/" + me.nodename + "/aplinfo";
	var store = new Ext.data.Store({
	    model: 'pve-aplinfo',
	    groupField: 'section',
	    proxy: {
                type: 'pve',
		url: '/api2/json' + baseurl
	    }
	});

	var sm = Ext.create('Ext.selection.RowModel', {});

	var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
            groupHeaderTpl: '{[ "Section: " + values.name ]} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
	});

	var reload = function() {
	    store.load();
	};

	PVE.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    viewConfig: {
		trackOver: false
	    },
	    features: [ groupingFeature ],
	    columns: [
		{
		    header: gettext('Type'),
		    width: 80,
		    dataIndex: 'type'
		},
		{
		    header: gettext('Package'),
		    flex: 1,
		    dataIndex: 'package'
		},
		{
		    header: gettext('Version'),
		    width: 80,
		    dataIndex: 'version'
		},
		{
		    header: gettext('Description'),
		    flex: 1.5,
		    dataIndex: 'headline'
		}
	    ],
	    listeners: {
		afterRender: reload
	    }
	});

	me.callParent();
    }

}, function() {

    Ext.define('pve-aplinfo', {
	extend: 'Ext.data.Model',
	fields: [ 
	    'template', 'type', 'package', 'version', 'headline', 'infopage', 
	    'description', 'os', 'section'
	],
	idProperty: 'template'
    });

});

Ext.define('PVE.storage.TemplateDownload', {
    extend: 'Ext.window.Window',
    alias: ['widget.pveTemplateDownload'],

    modal: true,

    initComponent : function() {
	/*jslint confusion: true */
        var me = this;

	var grid = Ext.create('PVE.grid.TemplateSelector', {
	    border: false,
	    autoScroll: true,
	    nodename: me.nodename
	});

	var sm = grid.getSelectionModel();

	var submitBtn = Ext.create('PVE.button.Button', {
	    text: gettext('Download'),
	    disabled: true,
	    selModel: sm,
	    handler: function(button, event, rec) {
		PVE.Utils.API2Request({
		    url: '/nodes/' + me.nodename + '/aplinfo',
		    params: { 
			storage: me.storage, 
			template: rec.data.template
		    },
		    method: 'POST',
		    failure: function (response, opts) {
			Ext.Msg.alert('Error', response.htmlStatus);
		    },
		    success: function(response, options) {
			var upid = response.result.data;
			
			var win = Ext.create('PVE.window.TaskViewer', { 
			    upid: upid
			});
			win.show();
			me.close();
		    }
		});
	    }
	});

        Ext.applyIf(me, {
            title: gettext('Templates'),
	    layout: 'fit',
	    width: 600,
	    height: 400,
	    items: grid,
	    buttons: [ submitBtn ]
	});

	me.callParent();
    }
});

Ext.define('PVE.storage.Upload', {
    extend: 'Ext.window.Window',
    alias: ['widget.pveStorageUpload'],

    resizable: false,

    modal: true,

    initComponent : function() {
	/*jslint confusion: true */
        var me = this;

	var xhr;

	if (!me.nodename) {
	    throw "no node name specified";
	}

	if (!me.storage) { 
	    throw "no storage ID specified";
	}

	var baseurl = "/nodes/" + me.nodename + "/storage/" + me.storage + "/upload";

	var pbar = Ext.create('Ext.ProgressBar', {
            text: 'Ready',
	    hidden: true
	});

	me.formPanel = Ext.create('Ext.form.Panel', {
	    method: 'POST',
	    waitMsgTarget: true,
	    bodyPadding: 10,
	    border: false,
	    width: 300,
	    fieldDefaults: {
		labelWidth: 100,
		anchor: '100%'
            },
	    items: [
		{
		    xtype: 'pveKVComboBox',
		    data: [
			['iso', 'ISO image'],
			['backup', 'VZDump backup file'],
			['vztmpl', 'OpenVZ template']
		    ],
		    fieldLabel: gettext('Content'),
		    name: 'content',
		    value: 'iso'
		},
		{
		    xtype: 'filefield',
		    name: 'filename',
		    buttonText: gettext('Select File...'),
		    allowBlank: false
		},
		pbar
	    ]
	});

	var form = me.formPanel.getForm();

	var doStandardSubmit = function() {
	    form.submit({
		url: "/api2/htmljs" + baseurl,
		waitMsg: gettext('Uploading file...'),
		success: function(f, action) {
		    me.close();
		},
		failure: function(f, action) {
		    var msg = PVE.Utils.extractFormActionError(action);
                    Ext.Msg.alert(gettext('Error'), msg);
		}
	    });
	};

	var updateProgress = function(per, bytes) {
	    var text = (per * 100).toFixed(2) + '%';
	    if (bytes) {
		text += " (" + PVE.Utils.format_size(bytes) + ')';
	    }
	    pbar.updateProgress(per, text);
	};
 
	var abortBtn = Ext.create('Ext.Button', {
	    text: gettext('Abort'),
	    disabled: true,
	    handler: function() {
		me.close();
	    }
	});

	var submitBtn = Ext.create('Ext.Button', {
	    text: gettext('Upload'),
	    disabled: true,
	    handler: function(button) {
		var fd;
		try {
		    fd = new FormData();
		} catch (err) {
		    doStandardSubmit();
		    return;
		}

		button.setDisabled(true);
		abortBtn.setDisabled(false);

		var field = form.findField('content');
		fd.append("content", field.getValue());
		field.setDisabled(true);

		field = form.findField('filename');
		var file = field.fileInputEl.dom;
		fd.append("filename", file.files[0]);
		field.setDisabled(true);

		pbar.setVisible(true);
		updateProgress(0);

		xhr = new XMLHttpRequest();

		xhr.addEventListener("load", function(e) {   
		    if (xhr.status == 200) {
			me.close();
		    } else {  
			var msg = "Error " + xhr.status.toString() + ": " + Ext.htmlEncode(xhr.statusText);
			var result = Ext.decode(xhr.responseText);
			result.message = msg;
			var htmlStatus = PVE.Utils.extractRequestError(result, true);
			Ext.Msg.alert(gettext('Error'), htmlStatus, function(btn) {
			    me.close();
			});

		    }  
		}, false);

		xhr.addEventListener("error", function(e) {
		    var msg = "Error " + e.target.status.toString() + " occurred while receiving the document.";
		    Ext.Msg.alert(gettext('Error'), msg, function(btn) {
			me.close();
		    });
		});
 
		xhr.upload.addEventListener("progress", function(evt) {
		    if (evt.lengthComputable) {  
			var percentComplete = evt.loaded / evt.total;  
			updateProgress(percentComplete, evt.loaded);
		    } 
		}, false);

		xhr.open("POST", "/api2/json" + baseurl, true);
		xhr.send(fd);		
	    }
	});

	form.on('validitychange', function(f, valid) {
	    submitBtn.setDisabled(!valid);
	});

        Ext.applyIf(me, {
            title: gettext('Upload'),
	    items: me.formPanel,
	    buttons: [ abortBtn, submitBtn ],
	    listeners: {
		close: function() {
		    if (xhr) {
			xhr.abort();
		    }
		}
	    }
	});

        me.callParent();
    }
});

Ext.define('PVE.storage.ContentView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveStorageContentView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var storage = me.pveSelNode.data.storage;
	if (!storage) { 
	    throw "no storage ID specified";
	}

	var baseurl = "/nodes/" + nodename + "/storage/" + storage + "/content";
	var store = new Ext.data.Store({
	    model: 'pve-storage-content',
	    groupField: 'content',
	    proxy: {
                type: 'pve',
		url: '/api2/json' + baseurl
	    },
	    sorters: { 
		property: 'volid', 
		order: 'DESC' 
	    }
	});

	var sm = Ext.create('Ext.selection.RowModel', {});

	var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
            groupHeaderTpl: '{[ PVE.Utils.format_content_types(values.name) ]} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
	});

	var reload = function() {
	    store.load();
	};

	PVE.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    viewConfig: {
		trackOver: false
	    },
	    features: [ groupingFeature ],
	    tbar: [
		{
		    xtype: 'pveButton',
		    text: gettext('Restore'),
		    selModel: sm,
		    disabled: true,
		    enableFn: function(rec) {
			return rec && rec.data.content === 'backup';
		    },
		    handler: function(b, e, rec) {
			var vmtype;
			if (rec.data.volid.match(/vzdump-qemu-/)) {
			    vmtype = 'qemu';
			} else if (rec.data.volid.match(/vzdump-openvz-/)) {
			    vmtype = 'openvz';
			} else {
			    return;
			}

			var win = Ext.create('PVE.window.Restore', {
			    nodename: nodename,
			    volid: rec.data.volid,
			    volidText: PVE.Utils.render_storage_content(rec.data.volid, {}, rec),
			    vmtype: vmtype
			});
			win.show();
			win.on('destroy', reload);
		    }
		},
		{
		    xtype: 'pveButton',
		    text: gettext('Remove'),
		    selModel: sm,
		    disabled: true,
		    confirmMsg: function(rec) {
			return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
						 "'" + rec.data.volid + "'");
		    },
		    enableFn: function(rec) {
			return rec && rec.data.content !== 'images';
		    },
		    handler: function(b, e, rec) {
			PVE.Utils.API2Request({
			    url: baseurl + '/' + rec.data.volid,
			    method: 'DELETE',
			    waitMsgTarget: me,
			    callback: function() {
				reload();
			    },
			    failure: function (response, opts) {
				Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			    }
			});
		    }
		},
		{
		    text: gettext('Templates'),
		    handler: function() {
			var win = Ext.create('PVE.storage.TemplateDownload', {
			    nodename: nodename,
			    storage: storage
			});
			win.show();
			win.on('destroy', reload);
		    }
		},
		{
		    text: gettext('Upload'),
		    handler: function() {
			var win = Ext.create('PVE.storage.Upload', {
			    nodename: nodename,
			    storage: storage
			});
			win.show();
			win.on('destroy', reload);
		    }
		}
	    ],
	    columns: [
		{
		    header: gettext('Name'),
		    flex: 1,
		    sortable: true,
		    renderer: PVE.Utils.render_storage_content,
		    dataIndex: 'text'
		},
		{
		    header: gettext('Format'),
		    width: 100,
		    dataIndex: 'format'
		},
		{
		    header: gettext('Size'),
		    width: 100,
		    renderer: PVE.Utils.format_size,
		    dataIndex: 'size'
		}
	    ],
	    listeners: {
		show: reload
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('pve-storage-content', {
	extend: 'Ext.data.Model',
	fields: [ 
	    'volid', 'content', 'format', 'size', 'used', 'vmid', 
	    'channel', 'id', 'lun',
	    {	
		name: 'text', 
		convert: function(value, record) {
		    if (value) {
			return value;
		    }
		    return PVE.Utils.render_storage_content(value, {}, record);
		}
	    }
	],
	idProperty: 'volid'
    });

});Ext.define('PVE.storage.StatusView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveStorageStatusView'],

    initComponent : function() {
	var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var storage = me.pveSelNode.data.storage;
	if (!storage) {
	    throw "no storage ID specified";
	}

	var rows = {
	    disable: {
		header: gettext('Enabled'), 
		required: true,
		renderer: PVE.Utils.format_neg_boolean	
	    },
	    active: {
		header: gettext('Active'), 
		required: true,		
		renderer: PVE.Utils.format_boolean
	    },
	    content: {
		header: gettext('Content'), 
		required: true,
		renderer: PVE.Utils.format_content_types
	    },
	    type: {
		header: gettext('Type'), 
		required: true,
		renderer: PVE.Utils.format_storage_type
	    },
	    shared: {
		header: gettext('Shared'), 
		required: true,
		renderer: PVE.Utils.format_boolean
	    },
	    total: {
		header: gettext('Size'), 
		required: true, 
		renderer: PVE.Utils.render_size
	    },
	    used: {
		header: gettext('Used'), 
		required: true, 
		renderer: function(value) {
		    // do not confuse users with filesystem details
		    var total = me.getObjectValue('total', 0);
		    var avail = me.getObjectValue('avail', 0);
		    return PVE.Utils.render_size(total - avail);
		}
	    },
	    avail: {
		header: gettext('Avail'), 
		required: true, 
		renderer: PVE.Utils.render_size
	    }
	};

	Ext.applyIf(me, {
	    title: gettext('Status'),
	    url: "/api2/json/nodes/" + nodename + "/storage/" + storage + "/status",
	    cwidth1: 150,
	    interval: 30000,
	    //height: 195,
	    rows: rows
	});

	me.callParent();
    }
});
Ext.define('PVE.storage.Summary', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pveStorageSummary',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var storage = me.pveSelNode.data.storage;
	if (!storage) {
	    throw "no storage ID specified";
	}

	var statusview = Ext.create('PVE.storage.StatusView', {
	    pveSelNode: me.pveSelNode,
	    style: 'padding-top:0px'
	});

	var rstore = statusview.rstore;

	var rrdurl = "/api2/png/nodes/" + nodename + "/storage/" + storage + "/rrd";

	Ext.apply(me, {
	    autoScroll: true,
	    bodyStyle: 'padding:10px',
	    defaults: {
		style: 'padding-top:10px',
		width: 800
	    },		
	    tbar: [
		'->',
		{
		    xtype: 'pveRRDTypeSelector'
		}
	    ],
	    items: [
		statusview,
		{
		    xtype: 'pveRRDView',
		    title: "Usage",
		    pveSelNode: me.pveSelNode,
		    datasource: 'total,used',
		    rrdurl: rrdurl
		}
	    ]
	});

	me.on('show', rstore.startUpdate);
	me.on('hide', rstore.stopUpdate);
	me.on('destroy', rstore.stopUpdate);	

	me.callParent();
    }
});
Ext.define('PVE.storage.Browser', {
    extend: 'PVE.panel.Config',
    alias: 'widget.PVE.storage.Browser',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var storeid = me.pveSelNode.data.storage;
	if (!storeid) {
	    throw "no storage ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	me.items = [
	    {
		title: gettext('Summary'),
		xtype: 'pveStorageSummary',
		itemId: 'summary'
	    }
	];

	Ext.apply(me, {
	    title: Ext.String.format(gettext("Storage {0} on node {1}"), 
				     "'" + storeid + "'", "'" + nodename + "'"),
	    hstateid: 'storagetab'
	});

	if (caps.storage['Datastore.Allocate']) {
	    me.items.push({
		xtype: 'pveStorageContentView',
		title: gettext('Content'),
		itemId: 'content'
	    });
	}

	if (caps.storage['Permissions.Modify']) {
	    me.items.push({
		xtype: 'pveACLView',
		title: gettext('Permissions'),
		itemId: 'permissions',
		path: '/storage/' + storeid
	    });
	}

	me.callParent();
   }
});
Ext.define('PVE.storage.DirInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'dir';
	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;

	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'path',
		value: '',
		fieldLabel: gettext('Directory'),
		allowBlank: false
	    },
	    {
		xtype: 'pveContentTypeSelector',
		name: 'content',
		value: 'images',
		multiSelect: true,
		fieldLabel: gettext('Content'),
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'shared',
		uncheckedValue: 0,
		fieldLabel: gettext('Shared')
	    },
	    {
		xtype: 'numberfield',
		fieldLabel: gettext('Max Backups'),
		name: 'maxfiles',
		minValue: 0,
		maxValue: 365,
		value: me.create ? '1' : undefined,
		allowBlank: false
	    }
	];

	if (me.create || me.storageId !== 'local') {
	    me.column2.unshift({
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    });
	}

	me.callParent();
    }
});

Ext.define('PVE.storage.DirEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.DirInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});

	Ext.apply(me, {
            subject: 'Directory',
	    isAdd: true,
	    items: [ ipanel ]
	});
	
	me.callParent();

	if (!me.create) {
	    me.load({
		success:  function(response, options) {
		    var values = response.result.data;
		    var ctypes = values.content || '';

		    values.content = ctypes.split(',');

		    if (values.nodes) {
			values.nodes = values.nodes.split(',');
		    }
		    values.enable = values.disable ? 0 : 1;

		    ipanel.setValues(values);
		}
	    });
	}
    }
});
Ext.define('PVE.storage.NFSScan', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pveNFSScan',

    queryParam: 'server',

    doRawQuery: function() {
    },

    onTriggerClick: function() {
	var me = this;

	if (!me.queryCaching || me.lastQuery !== me.nfsServer) {
	    me.store.removeAll();
	}

	me.allQuery = me.nfsServer;

	me.callParent();
    },

    setServer: function(server) {
	var me = this;

	me.nfsServer = server;
    },

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    me.nodename = 'localhost';
	}

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'path', 'options' ],
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes/' + me.nodename + '/scan/nfs'
	    }
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'path',
	    displayField: 'path',
	    matchFieldWidth: false,
	    listConfig: {
		loadingText: 'Scanning...',
		listeners: {
		    // hack: call setHeight to show scroll bars correctly
		    refresh: function(list) {
			var lh = PVE.Utils.gridLineHeigh();
			var count = store.getCount();
			list.setHeight(lh * ((count > 10) ? 10 : count));
		    }
		},
		width: 350
	    }
	});

	me.callParent();
    }
});

Ext.define('PVE.storage.NFSInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'nfs';
	    // hack: for now we always create nvf v3
	    // fixme: make this configurable
	    values.options = 'vers=3';
	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;
	
	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'server',
		value: '',
		fieldLabel: gettext('Server'),
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			if (me.create) {
			    var exportField = me.down('field[name=export]');
			    exportField.setServer(value);
			    exportField.setValue('');
			}
		    }
		}
	    },
	    {
		xtype: me.create ? 'pveNFSScan' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'export',
		value: '',
		fieldLabel: 'Export',
		allowBlank: false
	    },
	    {
		xtype: 'pveContentTypeSelector',
		name: 'content',
		value: 'images',
		multiSelect: true,
		fieldLabel: gettext('Content'),
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    },
	    {
		xtype: 'numberfield',
		fieldLabel: gettext('Max Backups'),
		name: 'maxfiles',
		minValue: 0,
		maxValue: 365,
		value: me.create ? '1' : undefined,
		allowBlank: false
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.storage.NFSEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.NFSInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});
	
	Ext.apply(me, {
            subject: 'NFS share',
	    isAdd: true,
	    items: [ ipanel ]
	});

	me.callParent();

	if (!me.create) {
	    me.load({
		success:  function(response, options) {
		    var values = response.result.data;
		    var ctypes = values.content || '';

		    values.content = ctypes.split(',');

		    if (values.nodes) {
			values.nodes = values.nodes.split(',');
		    }
		    values.enable = values.disable ? 0 : 1;
		    ipanel.setValues(values);
		}
	    });
	}
    }
});
Ext.define('PVE.storage.GlusterFsScan', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pveGlusterFsScan',

    queryParam: 'server',

    doRawQuery: function() {
    },

    onTriggerClick: function() {
	var me = this;

	if (!me.queryCaching || me.lastQuery !== me.glusterServer) {
	    me.store.removeAll();
	}

	me.allQuery = me.glusterServer;

	me.callParent();
    },

    setServer: function(server) {
	var me = this;

	me.glusterServer = server;
    },

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    me.nodename = 'localhost';
	}

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'volname' ],
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes/' + me.nodename + '/scan/glusterfs'
	    }
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'volname',
	    displayField: 'volname',
	    matchFieldWidth: false,
	    listConfig: {
		loadingText: 'Scanning...',
		listeners: {
		    // hack: call setHeight to show scroll bars correctly
		    refresh: function(list) {
			var lh = PVE.Utils.gridLineHeigh();
			var count = store.getCount();
			list.setHeight(lh * ((count > 10) ? 10 : count));
		    }
		},
		width: 350
	    }
	});

	me.callParent();
    }
});

Ext.define('PVE.storage.GlusterFsInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'glusterfs';
	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;
	
	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'server',
		value: '',
		fieldLabel: gettext('Server'),
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			if (me.create) {
			    var volumeField = me.down('field[name=volume]');
			    volumeField.setServer(value);
			    volumeField.setValue('');
			}
		    }
		}
	    },
	    {
		xtype: me.create ? 'pveGlusterFsScan' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'volume',
		value: '',
		fieldLabel: 'Volume name',
		allowBlank: false
	    },
	    {
		xtype: 'pveContentTypeSelector',
		name: 'content',
		value: 'images',
		multiSelect: true,
		fieldLabel: gettext('Content'),
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    },
	    {
		xtype: 'numberfield',
		fieldLabel: gettext('Max Backups'),
		name: 'maxfiles',
		minValue: 0,
		maxValue: 365,
		value: me.create ? '1' : undefined,
		allowBlank: false
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.storage.GlusterFsEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.GlusterFsInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});
	
	Ext.apply(me, {
            subject: 'GlusterFS Volume',
	    isAdd: true,
	    items: [ ipanel ]
	});

	me.callParent();

	if (!me.create) {
	    me.load({
		success:  function(response, options) {
		    var values = response.result.data;
		    var ctypes = values.content || '';

		    values.content = ctypes.split(',');

		    if (values.nodes) {
			values.nodes = values.nodes.split(',');
		    }
		    values.enable = values.disable ? 0 : 1;
		    ipanel.setValues(values);
		}
	    });
	}
    }
});
Ext.define('PVE.storage.IScsiScan', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pveIScsiScan',

    queryParam: 'portal',

    doRawQuery: function() {
    },

    onTriggerClick: function() {
	var me = this;

	if (!me.queryCaching || me.lastQuery !== me.portal) {
	    me.store.removeAll();
	}

	me.allQuery = me.portal;

	me.callParent();
    },

    setPortal: function(portal) {
	var me = this;

	me.portal = portal;
    },

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    me.nodename = 'localhost';
	}

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'target', 'portal' ],
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes/' + me.nodename + '/scan/iscsi'
	    }
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'target',
	    displayField: 'target',
	    matchFieldWidth: false,
	    listConfig: {
		loadingText: 'Scanning...',
		listeners: {
		    // hack: call setHeight to show scroll bars correctly
		    refresh: function(list) {
			var lh = PVE.Utils.gridLineHeigh();
			var count = store.getCount();
			list.setHeight(lh * ((count > 10) ? 10 : count));
		    }
		},
		width: 350
	    }
	});

	me.callParent();
    }
});

Ext.define('PVE.storage.IScsiInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'iscsi';
	} else {
	    delete values.storage;
	}

	values.content = values.luns ? 'images' : 'none';
	delete values.luns;

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;
	
	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'portal',
		value: '',
		fieldLabel: 'Portal',
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			if (me.create) {
			    var exportField = me.down('field[name=target]');
			    exportField.setPortal(value);
			    exportField.setValue('');
			}
		    }
		}
	    },
	    {
		readOnly: !me.create,
		xtype: me.create ? 'pveIScsiScan' : 'displayfield',
		name: 'target',
		value: '',
		fieldLabel: 'Target',
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    },
	    {
		xtype: 'checkbox',
		name: 'luns',
		checked: true,
		fieldLabel: gettext('Use LUNs directly')
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.storage.IScsiEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.IScsiInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});
	
	Ext.apply(me, {
            subject: 'iSCSI target',
	    isAdd: true,
	    items: [ ipanel ]
	});

	me.callParent();

	if (!me.create) {
	    me.load({
		success:  function(response, options) {
		    var values = response.result.data;
		    var ctypes = values.content || '';

		    if (values.storage === 'local') {
			values.content = ctypes.split(',');
		    }
		    if (values.nodes) {
			values.nodes = values.nodes.split(',');
		    }
		    values.enable = values.disable ? 0 : 1;
		    values.luns = (values.content === 'images') ? true : false;

		    ipanel.setValues(values);
		}
	    });
	}
    }
});
Ext.define('PVE.storage.VgSelector', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pveVgSelector',

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    me.nodename = 'localhost';
	}

	var store = Ext.create('Ext.data.Store', {
	    autoLoad: {}, // true,
	    fields: [ 'vg', 'size', 'free' ],
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes/' + me.nodename + '/scan/lvm'
	    }
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'vg',
	    displayField: 'vg',
	    queryMode: 'local',
	    editable: false,
	    listConfig: {
		loadingText: 'Scanning...',
		listeners: {
		    // hack: call setHeight to show scroll bars correctly
		    refresh: function(list) {
			var lh = PVE.Utils.gridLineHeigh();
			var count = store.getCount();
			list.setHeight(lh * ((count > 10) ? 10 : count));
		    }
		}
	    }
	});

	me.callParent();
    }
});

Ext.define('PVE.storage.BaseStorageSelector', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pveBaseStorageSelector',

    existingGroupsText: gettext("Existing volume groups"),

    initComponent : function() {
	var me = this;

	var store = Ext.create('Ext.data.Store', {
	    autoLoad: {
		addRecords: true,
		params: {
		    type: 'iscsi'
		}
	    },
	    fields: [ 'storage', 'type', 'content',
		      {
			  name: 'text',
			  convert: function(value, record) {
			      if (record.data.storage) {
				  return record.data.storage + " (iSCSI)";
			      } else {
				  return me.existingGroupsText;
			      }
			  }
		      }],
	    proxy: {
		type: 'pve',
		url: '/api2/json/storage/'
	    }
	});

	store.loadData([{ storage: '' }], true);

	Ext.apply(me, {
	    store: store,
	    queryMode: 'local',
	    editable: false,
	    value: '',
	    valueField: 'storage',
	    displayField: 'text'
	});

	me.callParent();
    }
});

Ext.define('PVE.storage.LVMInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'lvm';
	    values.content = 'images';
	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;
	
	return values;
    },

    initComponent : function() {
	var me = this;

	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		submitValue: !!me.create,
		allowBlank: false
	    }
	];

	var vgnameField = Ext.createWidget(me.create ? 'textfield' : 'displayfield', {
	    height: 22, // hack: set same height as text fields
	    name: 'vgname',
	    hidden: !!me.create,
	    disabled: !!me.create,
	    value: '',
	    fieldLabel: gettext('Volume group'),
	    allowBlank: false
	});

	if (me.create) {
	    var vgField = Ext.create('PVE.storage.VgSelector', {
		name: 'vgname',
		fieldLabel: gettext('Volume group'),
		allowBlank: false
	    });

	    var baseField = Ext.createWidget('pveFileSelector', {
		name: 'base',
		hidden: true,
		disabled: true,
		nodename: 'localhost',
		storageContent: 'images',
		fieldLabel: gettext('Base volume'),
		allowBlank: false
	    });

	    me.column1.push({
		xtype: 'pveBaseStorageSelector',
		name: 'basesel',
		fieldLabel: gettext('Base storage'),
		submitValue: false,
		listeners: {
		    change: function(f, value) {
			if (value) {
			    vgnameField.setVisible(true);
			    vgnameField.setDisabled(false);
			    vgField.setVisible(false);
			    vgField.setDisabled(true);
			    baseField.setVisible(true);
			    baseField.setDisabled(false);
			} else {
			    vgnameField.setVisible(false);
			    vgnameField.setDisabled(true);
			    vgField.setVisible(true);
			    vgField.setDisabled(false);
			    baseField.setVisible(false);
			    baseField.setDisabled(true);
			}
			baseField.setStorage(value);
		    }
		}
	    });

	    me.column1.push(baseField);

	    me.column1.push(vgField);
	}

	me.column1.push(vgnameField);

	me.column2 = [
	    {
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'shared',
		uncheckedValue: 0,
		fieldLabel: gettext('Shared')
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.storage.LVMEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.LVMInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});
	
	Ext.apply(me, {
            subject: 'LVM group',
	    isAdd: true,
	    items: [ ipanel ]
	});

	me.callParent();

	if (!me.create) {
	    me.load({
		success:  function(response, options) {
		    var values = response.result.data;
		    if (values.nodes) {
			values.nodes = values.nodes.split(',');
		    }
		    values.enable = values.disable ? 0 : 1;
		    ipanel.setValues(values);
		}
	    });
	}
    }
});
Ext.define('PVE.storage.RBDInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'rbd';
            values.content = 'images';

	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;

	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'pool',
		value: 'rbd',
		fieldLabel: gettext('Pool'),
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'monhost',
		value: '',
		fieldLabel: gettext('Monitor Host'),
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'username',
		value: 'admin',
		fieldLabel: gettext('User name'),
		allowBlank: true
	    }
	];

	me.column2 = [
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    }
	];

	if (me.create || me.storageId !== 'local') {
	    me.column2.unshift({
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    });
	}

	me.callParent();
    }
});

Ext.define('PVE.storage.RBDEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.RBDInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});

	Ext.apply(me, {
            subject: 'RBD Storage',
	    isAdd: true,
	    items: [ ipanel ]
	});
	
	me.callParent();

        if (!me.create) {
            me.load({
                success:  function(response, options) {
                    var values = response.result.data;
                    if (values.nodes) {
                        values.nodes = values.nodes.split(',');
                    }
                    values.enable = values.disable ? 0 : 1;
                    ipanel.setValues(values);
                }
            });
        }
    }
});
Ext.define('PVE.storage.SheepdogInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'sheepdog';
            values.content = 'images';

	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;

	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'portal',
		height: 22, // hack: set same height as text fields
		value: '127.0.0.1:7000',
		fieldLabel: gettext('Gateway'),
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    }
	];

	if (me.create || me.storageId !== 'local') {
	    me.column2.unshift({
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    });
	}

	me.callParent();
    }
});

Ext.define('PVE.storage.SheepdogEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.SheepdogInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});

	Ext.apply(me, {
            subject: 'Sheepdog Storage',
	    isAdd: true,
	    items: [ ipanel ]
	});
	
	me.callParent();

        if (!me.create) {
            me.load({
                success:  function(response, options) {
                    var values = response.result.data;
                    if (values.nodes) {
                        values.nodes = values.nodes.split(',');
                    }
                    values.enable = values.disable ? 0 : 1;
                    ipanel.setValues(values);
                }
            });
        }
    }
});
Ext.define('PVE.storage.NexentaInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'nexenta';
            values.content = 'images';

	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;

	values.ssl = values.enablessl ? 1 : 0;	    
	delete values.enablessl;

	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'portal',
		height: 22, // hack: set same height as text fields
		value: '',
		fieldLabel: gettext('Portal'),
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'target',
		height: 22, // hack: set same height as text fields
		value: 'iqn.1986-03.com.sun:02:....',
		fieldLabel: gettext('Target'),
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'pool',
		height: 22, // hack: set same height as text fields
		value: '',
		fieldLabel: gettext('Pool'),
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'login',
		height: 22, // hack: set same height as text fields
		value: '',
		fieldLabel: gettext('Login'),
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'password',
		height: 22, // hack: set same height as text fields
		value: '',
		fieldLabel: gettext('Password'),
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('Enable')
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'enablessl',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: gettext('ssl')
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'blocksize',
		height: 22, // hack: set same height as text fields
		value: '4K',
		fieldLabel: gettext('Block Size'),
		allowBlank: false
	    }
	];

	if (me.create || me.storageId !== 'local') {
	    me.column2.unshift({
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: gettext('Nodes'),
		emptyText: gettext('All') + ' (' + 
		    gettext('No restrictions') +')',
		multiSelect: true,
		autoSelect: false
	    });
	}

	me.callParent();
    }
});

Ext.define('PVE.storage.NexentaEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.NexentaInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});

	Ext.apply(me, {
            subject: 'Nexenta Storage',
	    isAdd: true,
	    items: [ ipanel ]
	});
	
	me.callParent();

        if (!me.create) {
            me.load({
                success:  function(response, options) {
                    var values = response.result.data;
                    if (values.nodes) {
                        values.nodes = values.nodes.split(',');
                    }
                    values.enable = values.disable ? 0 : 1;
                    values.enablessl = values.ssl ? 1 : 0;
                    ipanel.setValues(values);
                }
            });
        }
    }
});
Ext.define('PVE.dc.NodeView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveDcNodeView'],

    initComponent : function() {
	var me = this;

	var rstore = Ext.create('PVE.data.UpdateStore', {
	    interval: 3000,
	    storeid: 'pve-dc-nodes',
	    model: 'pve-dc-nodes',
	    proxy: {
                type: 'pve',
                url: "/api2/json/cluster/status"
	    },
	    filters: {
		property: 'type',
		value   : 'node'
	    }
	});

	var store = Ext.create('PVE.data.DiffStore', { rstore: rstore });

	Ext.apply(me, {
	    store: store,
	    stateful: false,
	    columns: [
		{
		    header: gettext('Name'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'name'
		},
		{
		    header: 'ID',
		    width: 50,
		    sortable: true,
		    dataIndex: 'nodeid'
		},
		{
		    header: gettext('Online'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'state',
		    renderer: PVE.Utils.format_boolean
		},
		{
		    header: gettext('Support'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'level',
		    renderer: PVE.Utils.render_support_level
		},
		{
		    header: gettext('Estranged'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'estranged',
		    renderer: PVE.Utils.format_boolean
		},
		{
		    header: gettext('Server Address'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'ip'
		},
		{
		    header: gettext('Services'),
		    flex: 1,
		    width: 80,
		    sortable: true,
		    dataIndex: 'pmxcfs',
		    renderer: function(value, metaData, record) {
			var list = [];
			var data = record.data;
			if (data) {
			    if (data.pmxcfs) {
				list.push('PVECluster');
			    }
			    if (data.rgmanager) {
				list.push('RGManager');
			    }

			}
			return list.join(', ');
		    }
		}
	    ], 
	    listeners: {
		show: rstore.startUpdate,
		hide: rstore.stopUpdate,
		destroy: rstore.stopUpdate
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('pve-dc-nodes', {
	extend: 'Ext.data.Model',
	fields: [ 'id', 'type', 'name', 'state', 'nodeid', 'ip', 
		  'pmxcfs', 'rgmanager', 'estranged', 'level' ],
	idProperty: 'id'
    });

});

Ext.define('PVE.dc.HAServiceView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveHaServiceView'],

    initComponent : function() {
	var me = this;

	var rstore = Ext.create('PVE.data.UpdateStore', {
	    interval: 3000,
	    storeid: 'pve-ha-services',
	    model: 'pve-ha-services',
	    proxy: {
                type: 'pve',
                url: "/api2/json/cluster/status"
	    },
	    filters: {
		property: 'type',
		value   : 'group'
	    }
	});

	var store = Ext.create('PVE.data.DiffStore', { rstore: rstore });

	var noClusterText = gettext("Standalone node - no cluster defined");
	var status = Ext.create('Ext.Component', {
	    padding: 2,
	    html: '&nbsp;',
	    dock: 'bottom'
	});

	Ext.apply(me, {
	    store: store,
	    stateful: false,
	    //tbar: [ 'start', 'stop' ],
	    bbar: [ status ],
	    columns: [
		{
		    header: gettext('Name'),
		    flex: 1,
		    sortable: true,
		    dataIndex: 'name'
		},
		{
		    header: gettext('Owner'),
		    flex: 1,
		    sortable: true,
		    dataIndex: 'owner'
		},
		{
		    header: gettext('Status'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'state_str'
		},
		{
		    header: gettext('Restarts'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'restarts'
		},
		{
		    header: gettext('Last transition'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'last_transition'
		},
		{
		    header: gettext('Last owner'),
		    flex: 1,
		    sortable: true,
		    dataIndex: 'last_owner'
		}
	    ], 
	    listeners: {
		show: rstore.startUpdate,
		hide: rstore.stopUpdate,
		destroy: rstore.stopUpdate
	    }
	});

	me.callParent();

	rstore.on('load', function(s, records, success) {
	    if (!success) {
		return;
	    }

	    var cluster_rec = rstore.getById('cluster');
	    var quorum_rec = rstore.getById('quorum');

	    if (!(cluster_rec && quorum_rec)) {
		status.update(noClusterText);
		return;
	    }

	    var cluster_raw = cluster_rec.raw;
	    var quorum_raw = quorum_rec.raw;
	    if (!(cluster_raw && quorum_raw)) {
		status.update(noClusterText);
		return;
	    }

	    status.update("Quorate: " + PVE.Utils.format_boolean(quorum_raw.quorate));
	});

    }
}, function() {

    Ext.define('pve-ha-services', {
	extend: 'Ext.data.Model',
	fields: [ 'id', 'type', 'name', 'owner', 'last_owner', 'state_str', 'restarts',
		  { name: 'last_transition',  type: 'date', dateFormat: 'timestamp'}
		],
	idProperty: 'id'
    });

});


Ext.define('PVE.dc.Summary', {
    extend: 'Ext.panel.Panel',

    alias: ['widget.pveDcSummary'],

    initComponent: function() {
        var me = this;

	var hagrid = Ext.create('PVE.dc.HAServiceView', {
	    title: gettext('HA Service Status'),
	    region: 'south',
	    border: false,
	    split: true,
	    flex: 1
	});

	var nodegrid = Ext.create('PVE.dc.NodeView', {
	    title: gettext('Nodes'),
	    border: false,
	    region: 'center',
	    flex: 3
	});

	Ext.apply(me, {
	    layout: 'border',
	    items: [ nodegrid, hagrid ],
	    listeners: {
		show: function() {
		    hagrid.fireEvent('show', hagrid);
		    nodegrid.fireEvent('show', hagrid);
		},
		hide: function() {
		    hagrid.fireEvent('hide', hagrid);
		    nodegrid.fireEvent('hide', hagrid);
		}
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.dc.HttpProxyEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	Ext.applyIf(me, {
	    subject: 'HTTP proxy',
	    items: {
		xtype: 'pvetextfield',
		name: 'http_proxy',
		vtype: 'HttpProxy',
		emptyText: gettext('Do not use any proxy'),
		deleteEmpty: true,
		value: '',
		fieldLabel: 'HTTP proxy'
	    }
	});

	me.callParent();

	me.load();
    }
});

Ext.define('PVE.dc.KeyboardEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	Ext.applyIf(me, {
	    subject: gettext('Keyboard Layout'),
	    items: {
		xtype: 'VNCKeyboardSelector',
		name: 'keyboard',
		value: '',
		fieldLabel: gettext('Keyboard Layout')
	    }
	});

	me.callParent();

	me.load();
    }
});

Ext.define('PVE.dc.OptionView', {
    extend: 'PVE.grid.ObjectGrid',
    alias: ['widget.pveDcOptionView'],

    noProxyText: gettext('Do not use any proxy'),

    initComponent : function() {
	var me = this;

	var reload = function() {
	    me.rstore.load();
	};

	var rows = {
	    keyboard: { 
		header: gettext('Keyboard Layout'), 
		editor: 'PVE.dc.KeyboardEdit',
		renderer: PVE.Utils.render_kvm_language,
		required: true 
	    },
	    http_proxy: { 
		header: 'HTTP proxy',
		editor: 'PVE.dc.HttpProxyEdit', 
		required: true,
		renderer: function(value) {
		    if (!value) {
			return me.noProxyText;
		    }
		    return value;
		}
	    }
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }
	    
	    var win = Ext.create(rowdef.editor, {
		url: "/api2/extjs/cluster/options",
		confid: rec.data.key
	    });
	    win.show();
	    win.on('destroy', reload);
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor
	});

	Ext.applyIf(me, {
	    url: "/api2/json/cluster/options",
	    cwidth1: 130,
	    interval: 1000,
	    selModel: sm,
	    tbar: [ edit_btn ],
	    rows: rows,
	    listeners: {
		itemdblclick: run_editor
	    }
	});

	me.callParent();

	me.on('show', reload);
    }
});
Ext.define('PVE.dc.StorageView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveStorageView'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-storage',
	    proxy: {
                type: 'pve',
		url: "/api2/json/storage"
	    },
	    sorters: { 
		property: 'storage', 
		order: 'DESC' 
	    }
	});

	var reload = function() {
	    store.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }
	    var type = rec.data.type;
	    
	    var editor;
	    if (type === 'dir') {
		editor = 'PVE.storage.DirEdit';
	    } else if (type === 'nfs') {
		editor = 'PVE.storage.NFSEdit';
	    } else if (type === 'glusterfs') {
		editor = 'PVE.storage.GlusterFsEdit';
	    } else if (type === 'lvm') {
		editor = 'PVE.storage.LVMEdit';
	    } else if (type === 'iscsi') {
		editor = 'PVE.storage.IScsiEdit';
	    } else if (type === 'rbd') {
		editor = 'PVE.storage.RBDEdit';
	    } else if (type === 'sheepdog') {
		editor = 'PVE.storage.SheepdogEdit';
	    } else if (type === 'nexenta') {
		editor = 'PVE.storage.NexentaEdit';
	    } else {
		return;
	    }
	    var win = Ext.create(editor, {
		storageId: rec.data.storage
	    });

	    win.show();
	    win.on('destroy', reload);
	};
	
	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor
	});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: function (rec) {
		return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					 "'" + rec.data.storage + "'");
	    },
	    handler: function(btn, event, rec) {
		PVE.Utils.API2Request({
		    url: '/storage/' + rec.data.storage,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    viewConfig: {
		trackOver: false
	    },
	    tbar: [ 
		{
		    text: gettext('Add'),
		    menu: new Ext.menu.Menu({
			items: [
			    {
				text: 'Directory',
				iconCls: 'pve-itype-icon-itype',
				handler: function() {
				    var win = Ext.create('PVE.storage.DirEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}

			    },
			    {
				text: 'LVM group',
				handler: function() {
				    var win = Ext.create('PVE.storage.LVMEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: 'NFS share',
				iconCls: 'pve-itype-icon-node',
				handler: function() {
				    var win = Ext.create('PVE.storage.NFSEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: 'iSCSI target',
				iconCls: 'pve-itype-icon-node',
				handler: function() {
				    var win = Ext.create('PVE.storage.IScsiEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: 'GlusterFS volume',
				iconCls: 'pve-itype-icon-node',
				handler: function() {
				    var win = Ext.create('PVE.storage.GlusterFsEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: 'RBD',
				iconCls: 'pve-itype-icon-node',
				handler: function() {
				    var win = Ext.create('PVE.storage.RBDEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}
			    }
/* the following type are conidered unstable
 * so we do not enable that on the GUI for now
			    {
				text: 'Sheepdog',
				iconCls: 'pve-itype-icon-node',
				handler: function() {
				    var win = Ext.create('PVE.storage.SheepdogEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: 'Nexenta',
				iconCls: 'pve-itype-icon-node',
				handler: function() {
				    var win = Ext.create('PVE.storage.NexentaEdit', {});
				    win.on('destroy', reload);
				    win.show();
				}
			    },
*/
			]
		    })
		},
		remove_btn,
		edit_btn
	    ],
	    columns: [
		{
		    header: 'ID',
		    width: 100,
		    sortable: true,
		    dataIndex: 'storage'
		},
		{
		    header: gettext('Type'),
		    width: 60,
		    sortable: true,
		    dataIndex: 'type',
		    renderer: PVE.Utils.format_storage_type
		},
		{
		    header: gettext('Content'),
		    width: 150,
		    sortable: true,
		    dataIndex: 'content',
		    renderer: PVE.Utils.format_content_types
		},
		{
		    header: 'Path/Target',
		    flex: 1,
		    sortable: true,
		    dataIndex: 'path',
		    renderer: function(value, metaData, record) {
			if (record.data.target) {
			    return record.data.target;
			}
			return value;
		    }
		},
		{
		    header: gettext('Shared'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'shared',
		    renderer: PVE.Utils.format_boolean
		},
		{
		    header: gettext('Enable'),
		    width: 80,
		    sortable: true,
		    dataIndex: 'disable',
		    renderer: PVE.Utils.format_neg_boolean
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('pve-storage', {
	extend: 'Ext.data.Model',
	fields: [ 
	    'path', 'type', 'content', 'server', 'portal', 'target', 'export', 'storage',
	    { name: 'shared', type: 'boolean'},
	    { name: 'disable', type: 'boolean'} 
	],
	idProperty: 'storage'
    });

});
Ext.define('PVE.dc.UserEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveDcUserEdit'],

    isAdd: true,

    initComponent : function() {
        var me = this;

        me.create = !me.userid;

        var url;
        var method;
        var realm;

        if (me.create) {
            url = '/api2/extjs/access/users';
            method = 'POST';
        } else {
            url = '/api2/extjs/access/users/' + me.userid;
            method = 'PUT';
	}

	var verifypw;
	var pwfield;

	var validate_pw = function() {
	    if (verifypw.getValue() !== pwfield.getValue()) {
		return gettext("Passwords does not match");
	    }
	    return true;
	};

	verifypw = Ext.createWidget('textfield', { 
	    inputType: 'password',
	    fieldLabel: gettext('Confirm password'), 
	    name: 'verifypassword',
	    submitValue: false,
	    disabled: true,
	    hidden: true,
	    validator: validate_pw
	});

	pwfield = Ext.createWidget('textfield', { 
	    inputType: 'password',
	    fieldLabel: gettext('Password'), 
	    minLength: 5,
	    name: 'password',
	    disabled: true,
	    hidden: true,
	    validator: validate_pw
	});

	var update_passwd_field = function(realm) {
	    if (realm === 'pve') {
		pwfield.setVisible(true);
		pwfield.setDisabled(false);
		verifypw.setVisible(true);
		verifypw.setDisabled(false);
	    } else {
		pwfield.setVisible(false);
		pwfield.setDisabled(true);
		verifypw.setVisible(false);
		verifypw.setDisabled(true);
	    }

	};

        var column1 = [
            {
                xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
                name: 'userid',
                fieldLabel: gettext('User name'),
                value: me.userid,
                allowBlank: false,
                submitValue: me.create ? true : false
            },
	    pwfield, verifypw,
	    {
		xtype: 'pveGroupSelector',
		name: 'groups',
		multiSelect: true,
		allowBlank: true,
		fieldLabel: gettext('Group')
	    },
            {
                xtype: 'datefield',
                name: 'expire',
		emptyText: 'never',
		format: 'Y-m-d',
		submitFormat: 'U',
                fieldLabel: gettext('Expire')
            },
	    {
		xtype: 'pvecheckbox',
		fieldLabel: gettext('Enabled'),
		name: 'enable',
		uncheckedValue: 0,
		defaultValue: 1,
		checked: true
	    }
        ];

        var column2 = [
	    {
		xtype: 'textfield',
		name: 'firstname',
		fieldLabel: gettext('First Name')
	    },
	    {
		xtype: 'textfield',
		name: 'lastname',
		fieldLabel: gettext('Last Name')
	    },
	    {
		xtype: 'textfield',
		name: 'email',
		fieldLabel: 'E-Mail',
		vtype: 'email'
	    },
	    {
		xtype: 'textfield',
		name: 'comment',
		fieldLabel: gettext('Comment')
	    }
	];
 
        if (me.create) {
            column1.splice(1,0,{
                xtype: 'pveRealmComboBox',
                name: 'realm',
                fieldLabel: gettext('Realm'),
                allowBlank: false,
		matchFieldWidth: false,
		listConfig: { width: 300 },
                listeners: {
                    change: function(combo, newValue){
                        realm = newValue;
			update_passwd_field(realm);
                    }
                },
                submitValue: false
            });
        }

	var ipanel = Ext.create('PVE.panel.InputPanel', {
	    column1: column1,
	    column2: column2,
	    onGetValues: function(values) {
		// hack: ExtJS datefield does not submit 0, so we need to set that
		if (!values.expire) {
		    values.expire = 0;
		}

		if (realm) {
		    values.userid = values.userid + '@' + realm;
		}

		if (!values.password) {
		    delete values.password;
		}

		return values;
	    }
	});

	Ext.applyIf(me, {
            subject: gettext('User'),
            url: url,
            method: method,
	    items: [ ipanel ]
        });

        me.callParent();

        if (!me.create) {
            me.load({
		success: function(response, options) {
		    var data = response.result.data;
		    if (Ext.isDefined(data.expire)) {
			if (data.expire) {
			    data.expire = new Date(data.expire * 1000);
			} else {
			    // display 'never' instead of '1970-01-01'
			    data.expire = null;
			}
		    }
		    me.setValues(data);
                }
            });
        }
    }
});
Ext.define('PVE.window.PasswordEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	if (!me.userid) {
	    throw "no userid specified";
	}

	var verifypw;
	var pwfield;

	var validate_pw = function() {
	    if (verifypw.getValue() !== pwfield.getValue()) {
		return gettext("Passwords does not match");
	    }
	    return true;
	};

	verifypw = Ext.createWidget('textfield', { 
	    inputType: 'password',
	    fieldLabel: gettext('Confirm password'), 
	    name: 'verifypassword',
	    submitValue: false,
	    validator: validate_pw
	});

	pwfield = Ext.createWidget('textfield', { 
	    inputType: 'password',
	    fieldLabel: gettext('Password'), 
	    minLength: 5,
	    name: 'password',
	    validator: validate_pw
	});

	Ext.apply(me, {
	    subject: gettext('Password'),
	    url: '/api2/extjs/access/password',
	    items: [
		pwfield, verifypw,
		{
		    xtype: 'hiddenfield',
		    name: 'userid',
		    value: me.userid
		}
	    ]
	});

	me.callParent();
    }
});

Ext.define('PVE.dc.UserView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveUserView'],

    initComponent : function() {
	var me = this;

	var caps = Ext.state.Manager.get('GuiCap');

	var store = new Ext.data.Store({
            id: "users",
	    model: 'pve-users',
	    sorters: { 
		property: 'userid', 
		order: 'DESC' 
	    }
	});

	var reload = function() {
	    store.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    enableFn: function(rec) {
		if (!caps.access['User.Modify']) {
		    return false;
		}
		return rec.data.userid !== 'root@pam';
	    },
	    confirmMsg: function (rec) {
		return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					 "'" + rec.data.userid + "'");
	    },
	    handler: function(btn, event, rec) {
		var userid = rec.data.userid;

		PVE.Utils.API2Request({
		    url: '/access/users/' + userid,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
        });
 
	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec || !caps.access['User.Modify']) {
		return;
	    }

            var win = Ext.create('PVE.dc.UserEdit',{
                userid: rec.data.userid
            });
            win.on('destroy', reload);
            win.show();
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    enableFn: function(rec) {
		return !!caps.access['User.Modify'];
	    },
	    selModel: sm,
	    handler: run_editor
	});

	var pwchange_btn = new PVE.button.Button({
	    text: gettext('Password'),
	    disabled: true,
	    selModel: sm,
	    handler: function(btn, event, rec) {
		var win = Ext.create('PVE.window.PasswordEdit',{
                    userid: rec.data.userid
		});
		win.on('destroy', reload);
		win.show();
	    }
	});

        var tbar = [
            {
		text: gettext('Add'),
		disabled: !caps.access['User.Modify'],
		handler: function() {
                    var win = Ext.create('PVE.dc.UserEdit',{
                    });
                    win.on('destroy', reload);
                    win.show();
		}
            },
	    edit_btn, remove_btn, pwchange_btn
        ];

	var render_full_name = function(firstname, metaData, record) {

	    var first = firstname || '';
	    var last = record.data.lastname || '';
	    return first + " " + last;
	};

	var render_username = function(userid) {
	    return userid.match(/^(.+)(@[^@]+)$/)[1];
	};

	var render_realm = function(userid) {
	    return userid.match(/@([^@]+)$/)[1];
	};

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    tbar: tbar,
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('User name'),
		    width: 200,
		    sortable: true,
		    renderer: render_username,
		    dataIndex: 'userid'
		},
		{
		    header: gettext('Realm'),
		    width: 100,
		    sortable: true,
		    renderer: render_realm,
		    dataIndex: 'userid'
		},
		{
		    header: gettext('Enabled'),
		    width: 80,
		    sortable: true,
		    renderer: PVE.Utils.format_boolean,
		    dataIndex: 'enable'
		},
		{
		    header: gettext('Expire'),
		    width: 80,
		    sortable: true,
		    renderer: PVE.Utils.format_expire, 
		    dataIndex: 'expire'
		},
		{
		    header: gettext('Name'),
		    width: 150,
		    sortable: true,
		    renderer: render_full_name,
		    dataIndex: 'firstname'
		},
		{
		    id: 'comment',
		    header: gettext('Comment'),
		    sortable: false,
		    dataIndex: 'comment',
		    flex: 1
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.dc.PoolView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pvePoolView'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-pools',
	    sorters: { 
		property: 'poolid', 
		order: 'DESC' 
	    }
	});

        var reload = function() {
            store.load();
        };

	var sm = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: function (rec) {
		return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					 "'" + rec.data.poolid + "'");
	    },
	    handler: function(btn, event, rec) {
		PVE.Utils.API2Request({
		    url: '/pools/' + rec.data.poolid,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

            var win = Ext.create('PVE.dc.PoolEdit',{
                poolid: rec.data.poolid
            });
            win.on('destroy', reload);
            win.show();
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor
	});

	var tbar = [
            {
		text: gettext('Create'),
		handler: function() {
		    var win = Ext.create('PVE.dc.PoolEdit', {});
		    win.on('destroy', reload);
		    win.show();
		}
            },
	    edit_btn, remove_btn
        ];

	PVE.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    tbar: tbar,
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('Name'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'poolid'
		},
		{
		    header: gettext('Comment'),
		    sortable: false,
		    dataIndex: 'comment',
		    flex: 1
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.dc.PoolEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveDcPoolEdit'],

    initComponent : function() {
        var me = this;

        me.create = !me.poolid;

        var url;
        var method;

        if (me.create) {
            url = '/api2/extjs/pools';
            method = 'POST';
        } else {
            url = '/api2/extjs/pools/' + me.poolid;
            method = 'PUT';
        }

        Ext.applyIf(me, {
            subject: gettext('Pool'),
            url: url,
            method: method,
            items: [
                {
		    xtype: me.create ? 'pvetextfield' : 'displayfield',
		    fieldLabel: gettext('Name'),
		    name: 'poolid',
		    value: me.poolid,
		    allowBlank: false
		},
                {
		    xtype: 'textfield',
		    fieldLabel: gettext('Comment'),
		    name: 'comment',
		    allowBlank: true
		}
            ]
        });

        me.callParent();

        if (!me.create) {
            me.load();
        }
    }
});
Ext.define('PVE.dc.GroupView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveGroupView'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-groups',
	    sorters: { 
		property: 'groupid', 
		order: 'DESC' 
	    }
	});

        var reload = function() {
            store.load();
        };

	var sm = Ext.create('Ext.selection.RowModel', {});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: function (rec) {
		return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					 "'" + rec.data.groupid + "'");
	    },
	    handler: function(btn, event, rec) {
		PVE.Utils.API2Request({
		    url: '/access/groups/' + rec.data.groupid,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

            var win = Ext.create('PVE.dc.GroupEdit',{
                groupid: rec.data.groupid
            });
            win.on('destroy', reload);
            win.show();
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor
	});

	var tbar = [
            {
		text: gettext('Create'),
		handler: function() {
		    var win = Ext.create('PVE.dc.GroupEdit', {});
		    win.on('destroy', reload);
		    win.show();
		}
            },
	    edit_btn, remove_btn
        ];

	PVE.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    tbar: tbar,
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('Name'),
		    width: 200,
		    sortable: true,
		    dataIndex: 'groupid'
		},
		{
		    header: gettext('Comment'),
		    sortable: false,
		    dataIndex: 'comment',
		    flex: 1
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.dc.GroupEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveDcGroupEdit'],

    initComponent : function() {
        var me = this;

        me.create = !me.groupid;

        var url;
        var method;

        if (me.create) {
            url = '/api2/extjs/access/groups';
            method = 'POST';
        } else {
            url = '/api2/extjs/access/groups/' + me.groupid;
            method = 'PUT';
        }

        Ext.applyIf(me, {
            subject: gettext('Group'),
            url: url,
            method: method,
            items: [
                {
		    xtype: me.create ? 'pvetextfield' : 'displayfield',
		    fieldLabel: gettext('Name'),
		    name: 'groupid',
		    value: me.groupid,
		    allowBlank: false
		},
                {
		    xtype: 'textfield',
		    fieldLabel: gettext('Comment'),
		    name: 'comment',
		    allowBlank: true
		}
            ]
        });

        me.callParent();

        if (!me.create) {
            me.load();
        }
    }
});
Ext.define('PVE.dc.RoleView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveRoleView'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-roles',
	    sorters: { 
		property: 'roleid', 
		order: 'DESC' 
	    }
	});

	var render_privs = function(value, metaData) {

	    if (!value) {
		return '-';
	    }

	    // allow word wrap
	    metaData.style = 'white-space:normal;';

	    return value.replace(/\,/g, ' ');
	};

	PVE.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    stateful: false,

	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('Name'),
		    width: 150,
		    sortable: true,
		    dataIndex: 'roleid'
		},
		{
		    id: 'privs',
		    header: gettext('Privileges'),
		    sortable: false,
		    renderer: render_privs,
		    dataIndex: 'privs',
		    flex: 1
		}
	    ],
	    listeners: {
		show: function() {
		    store.load();
		}
	    }
	});

	me.callParent();
    }
});Ext.define('PVE.dc.ACLAdd', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveACLAdd'],

    initComponent : function() {
	/*jslint confusion: true */
        var me = this;

	me.create = true;

	var items = [
	    {
		xtype: me.path ? 'hiddenfield' : 'textfield',
		name: 'path',
		value: me.path,
		allowBlank: false,
		fieldLabel: gettext('Path')
	    }
	];

	if (me.aclType === 'group') {
	    me.subject = gettext("Group Permission");
	    items.push({
		xtype: 'pveGroupSelector',
		name: 'groups',
		fieldLabel: gettext('Group')
	    });
	} else if (me.aclType === 'user') {
	    me.subject = gettext("User Permission");
	    items.push({
		xtype: 'pveUserSelector',
		name: 'users',
		fieldLabel: gettext('User')
	    });
	} else {
	    throw "unknown ACL type";
	}

	items.push({
	    xtype: 'pveRoleSelector',
	    name: 'roles',
	    value: 'NoAccess',
	    fieldLabel: gettext('Role')
	});

	if (!me.path) {
	    items.push({
		xtype: 'pvecheckbox',
		name: 'propagate',
		checked: true,
		fieldLabel: gettext('Propagate')
	    });
	}

	var ipanel = Ext.create('PVE.panel.InputPanel', {
	    items: items
	});

	Ext.apply(me, {
	    url: '/access/acl',
	    method: 'PUT',
	    isAdd: true,
	    items: [ ipanel ]
	});
	    
	me.callParent();
    }
});

Ext.define('PVE.dc.ACLView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveACLView'],

    // use fixed path
    path: undefined,

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-acl',
	    proxy: {
                type: 'pve',
		url: "/api2/json/access/acl"
	    },
	    sorters: { 
		property: 'path', 
		order: 'DESC' 
	    }
	});

	if (me.path) {
	    store.filters.add(new Ext.util.Filter({
		filterFn: function(item) {
		    if (item.data.path === me.path) {
			return true;
		    }
		}
	    }));
	}

	var render_ugid = function(ugid, metaData, record) {
	    if (record.data.type == 'group') {
		return '@' + ugid;
	    }

	    return ugid;
	};

	var columns = [
	    {
		header: gettext('User') + '/' + gettext('Group'),
		flex: 1,
		sortable: true,
		renderer: render_ugid,
		dataIndex: 'ugid'
	    },
	    {
		header: gettext('Role'),
		flex: 1,
		sortable: true,
		dataIndex: 'roleid'
	    }
	];

	if (!me.path) {
	    columns.unshift({
		header: gettext('Path'),
		flex: 1,
		sortable: true,
		dataIndex: 'path'
	    });
	    columns.push({
		header: gettext('Propagate'),
		width: 80,
		sortable: true,
		dataIndex: 'propagate'
	    });
	}

	var sm = Ext.create('Ext.selection.RowModel', {});

	var reload = function() {
	    store.load();
	};

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: gettext('Are you sure you want to remove this entry'),
	    handler: function(btn, event, rec) {
		var params = { 
		    'delete': 1, 
		    path: rec.data.path, 
		    roles: rec.data.roleid
		};
		if (rec.data.type === 'group') {
		    params.groups = rec.data.ugid;
		} else if (rec.data.type === 'user') {
		    params.users = rec.data.ugid;
		} else {
		    throw 'unknown data type';
		}

		PVE.Utils.API2Request({
		    url: '/access/acl',
		    params: params,
		    method: 'PUT',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	PVE.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    tbar: [
		{
		    text: gettext('Add'),
		    menu: new Ext.menu.Menu({
			items: [
			    {
				text: gettext('Group Permission'),
				handler: function() {
				    var win = Ext.create('PVE.dc.ACLAdd',{
					aclType: 'group',
					path: me.path
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: gettext('User Permission'),
				handler: function() {
				    var win = Ext.create('PVE.dc.ACLAdd',{
					aclType: 'user',
					path: me.path
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    }
			]
		    })
		},
		remove_btn
	    ],
	    viewConfig: {
		trackOver: false
	    },
	    columns: columns,
	    listeners: {
		show: reload
	    }
	});

	me.callParent();
    }
}, function() {

    Ext.define('pve-acl', {
	extend: 'Ext.data.Model',
	fields: [ 
	    'path', 'type', 'ugid', 'roleid', 
	    { 
		name: 'propagate', 
		type: 'boolean'
	    } 
	]
    });

});Ext.define('PVE.dc.AuthView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveAuthView'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-domains',
	    sorters: { 
		property: 'realm', 
		order: 'DESC' 
	    }
	});

	var reload = function() {
	    store.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    if (rec.data.type === 'pve' || rec.data.type === 'pam') {
		return;
	    }

            var win = Ext.create('PVE.dc.AuthEdit',{
                realm: rec.data.realm,
		authType: rec.data.type
            });
            win.on('destroy', reload);
            win.show();
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    enableFn: function(rec) {
		return !(rec.data.type === 'pve' || rec.data.type === 'pam');
	    },
	    handler: run_editor
	});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: function (rec) {
		return Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					 "'" + rec.data.realm + "'");
	    },
	    enableFn: function(rec) {
		return !(rec.data.type === 'pve' || rec.data.type === 'pam');
	    },
	    handler: function(btn, event, rec) {
		var realm = rec.data.realm;

		PVE.Utils.API2Request({
		    url: '/access/domains/' + realm,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
        });

        var tbar = [
	    {
		text: gettext('Add'),
		menu: new Ext.menu.Menu({
		    items: [
			{
			    text: 'Active Directory Server',
			    handler: function() {
				var win = Ext.create('PVE.dc.AuthEdit', {
				    authType: 'ad'
				});
				win.on('destroy', reload);
				win.show();
			    }
			},
			{
			    text: 'LDAP Server',
			    handler: function() {
				var win = Ext.create('PVE.dc.AuthEdit',{
				    authType: 'ldap'
				});
				win.on('destroy', reload);
				win.show();
			    }
			}
		    ]
		})
	    },
	    edit_btn, remove_btn
        ];

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
            tbar: tbar,
	    viewConfig: {
		trackOver: false
	    },
	    columns: [
		{
		    header: gettext('Realm'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'realm'
		},
		{
		    header: gettext('Type'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'type'
		},
		{
		    id: 'comment',
		    header: gettext('Comment'),
		    sortable: false,
		    dataIndex: 'comment',
		    flex: 1
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
Ext.define('PVE.dc.AuthEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveDcAuthEdit'],

    isAdd: true,

    initComponent : function() {
        var me = this;

        me.create = !me.realm;

        var url;
        var method;
        var serverlist;

        if (me.create) {
            url = '/api2/extjs/access/domains';
            method = 'POST';
        } else {
            url = '/api2/extjs/access/domains/' + me.realm;
            method = 'PUT';
        }

        var column1 = [
            {
                xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
                name: 'realm',
                fieldLabel: gettext('Realm'),
                value: me.realm,
                allowBlank: false
            }
	];

	if (me.authType === 'ad') {

	    me.subject = 'Active Directory Server';

            column1.push({
                xtype: 'textfield',
                name: 'domain',
                fieldLabel: 'Domain',
                emptyText: 'company.net',
                allowBlank: false
            });

	} else if (me.authType === 'ldap') {

	    me.subject = 'LDAP Server';

            column1.push({
                xtype: 'textfield',
                name: 'base_dn',
                fieldLabel: 'Base Domain Name',
		emptyText: 'CN=Users,DC=Company,DC=net',
                allowBlank: false
            });

            column1.push({
                xtype: 'textfield',
                name: 'user_attr',
                emptyText: 'uid / sAMAccountName',
                fieldLabel: 'User Attribute Name',
                allowBlank: false
            });

	} else {
	    throw 'unknown auth type ';
	}

        column1.push({
            xtype: 'textfield',
            name: 'comment',
            fieldLabel: gettext('Comment')
        });

        column1.push({
            xtype: 'pvecheckbox',
            fieldLabel: gettext('Default'),
            name: 'default',
            uncheckedValue: 0
        });

        var column2 = [
            {
                xtype: 'textfield',
                fieldLabel: gettext('Server'),
                name: 'server1',
                allowBlank: false
            },
            {
                xtype: 'pvetextfield',
                fieldLabel: gettext('Fallback Server'),
		deleteEmpty: !me.create,
		name: 'server2'
            },
            {
                xtype: 'numberfield',
                name: 'port',
                fieldLabel: gettext('Port'),
                minValue: 1,
                maxValue: 65535,
		emptyText: gettext('Default'),
		submitEmptyText: false
            },
            {
                xtype: 'pvecheckbox',
                fieldLabel: 'SSL',
                name: 'secure',
                uncheckedValue: 0
            }
        ];

	var ipanel = Ext.create('PVE.panel.InputPanel', {
	    column1: column1,
	    column2: column2,
	    onGetValues: function(values) {
		if (!values.port) {
		    if (!me.create) {
			PVE.Utils.assemble_field_data(values, { 'delete': 'port' });
		    }
		    delete values.port;
		}

		if (me.create) {
		    values.type = me.authType;
		}

		return values;
	    }
	});

	Ext.applyIf(me, {
            url: url,
            method: method,
	    fieldDefaults: {
		labelWidth: 120
	    },
	    items: [ ipanel ]
        });

        me.callParent();

        if (!me.create) {
            me.load({
                success: function(response, options) {
		    var data = response.result.data || {};
		    // just to be sure (should not happen)
		    if (data.type !== me.authType) {
			me.close();
			throw "got wrong auth type";
		    }
                    me.setValues(data);
                }
            });
        }
    }
});
Ext.define('PVE.dc.BackupEdit', {
    extend: 'PVE.window.Edit',
    alias: ['widget.pveDcBackupEdit'],

    initComponent : function() {
	/*jslint confusion: true */
         var me = this;

        me.create = !me.jobid;

	var url;
	var method;

	if (me.create) {
            url = '/api2/extjs/cluster/backup';
            method = 'POST';
        } else {
            url = '/api2/extjs/cluster/backup/' + me.jobid;
            method = 'PUT';
        }

	var vmidField = Ext.create('Ext.form.field.Hidden', {
	    name: 'vmid'
	});

	var selModeField =  Ext.create('PVE.form.KVComboBox', {
	    xtype: 'pveKVComboBox',
	    data: [
		['include', gettext('Include selected VMs')],
		['all', gettext('All')],
		['exclude', gettext('Exclude selected VMs')]
	    ],
	    fieldLabel: gettext('Selection mode'),
	    name: 'selMode',
	    value: ''
	});

	var insideUpdate = false;
	
	var sm = Ext.create('Ext.selection.CheckboxModel', {
	    mode: 'SIMPLE',
	    listeners: {
		selectionchange: function(model, selected) {
		    if (!insideUpdate) { // avoid endless loop
			var sel = [];
			Ext.Array.each(selected, function(record) {
			    sel.push(record.data.vmid);
			});

			vmidField.setValue(sel);
		    }
		}
	    }
	});

	var storagesel = Ext.create('PVE.form.StorageSelector', {
	    fieldLabel: gettext('Storage'),
	    nodename: 'localhost',
	    storageContent: 'backup',
	    allowBlank: false,
	    name: 'storage'
	});

	var store = new Ext.data.Store({
	    model: 'PVEResources',
	    sorters: { 
		property: 'vmid', 
		order: 'ASC' 
	    }
	});

	var vmgrid = Ext.createWidget('grid', {
	    store: store,
	    border: true,
	    height: 300,
	    selModel: sm,
	    disabled: true,
	    columns: [
		{ 
		    header: 'ID',
		    dataIndex: 'vmid',
		    width: 60
		},
		{ 
		    header: gettext('Node'),
		    dataIndex: 'node'
		},
		{ 
		    header: gettext('Status'),
		    dataIndex: 'uptime',
		    renderer: function(value) {
			if (value) {
			    return PVE.Utils.runningText;
			} else {
			    return PVE.Utils.stoppedText;
			}
		    }
		},
		{ 
		    header: gettext('Name'), 
		    dataIndex: 'name',
		    flex: 1 
		},
		{ 
		    header: gettext('Type'), 
		    dataIndex: 'type'
		}
	    ]
	});

	var nodesel = Ext.create('PVE.form.NodeSelector', {
	    name: 'node',
	    fieldLabel: gettext('Node'),
	    allowBlank: true,
	    editable: true,
	    autoSelect: false,
	    emptyText: '-- ' + gettext('All') + ' --',
	    listeners: {
		change: function(f, value) {
		    storagesel.setNodename(value || 'localhost');
		    var mode = selModeField.getValue();
		    store.clearFilter();
		    store.filterBy(function(rec) {
			return (!value || rec.get('node') === value);
		    });
		    if (mode === 'all') {
			sm.selectAll(true);
		    }
		}
	    }
	});

	var column1 = [
	    nodesel,
	    storagesel,
	    {
		xtype: 'pveDayOfWeekSelector',
		name: 'dow',
		fieldLabel: gettext('Day of week'),
		multiSelect: true,
		value: ['sat'],
		allowBlank: false
	    },
	    {
		xtype: 'timefield',
		fieldLabel: gettext('Start Time'),
		name: 'starttime',
		format: 'H:i',
		value: '00:00',
		allowBlank: false
	    },
	    selModeField
	];

	var column2 = [
	    {
		xtype: 'textfield',
		fieldLabel: gettext('Send email to'),
		name: 'mailto'
	    },
	    {
		xtype: 'pveCompressionSelector',
		fieldLabel: gettext('Compression'),
		name: 'compress',
		deleteEmpty: me.create ? false : true,
		value: me.create ? 'lzo' : ''
	    },
	    {
		xtype: 'pveBackupModeSelector',
		fieldLabel: gettext('Mode'),
		value: 'snapshot',
		name: 'mode'
	    },
	    vmidField
	];

	var ipanel = Ext.create('PVE.panel.InputPanel', {
	    column1: column1,
	    column2:  column2,
	    onGetValues: function(values) {
		if (!values.node) {
		    if (!me.create) {
			PVE.Utils.assemble_field_data(values, { 'delete': 'node' }); 
		    }
		    delete values.node;
		}

		var selMode = values.selMode;
		delete values.selMode;

		if (selMode === 'all') {
		    values.all = 1;
		    values.exclude = '';
		    delete values.vmid;
		} else if (selMode === 'exclude') {
		    values.all = 1;
		    values.exclude = values.vmid;
		    delete values.vmid;
		}
		return values;
	    }
	});

	var update_vmid_selection = function(list, mode) {
	    if (insideUpdate) {
		return; // should not happen - just to be sure
	    }
	    insideUpdate = true;
	    if (mode !== 'all') {
		sm.deselectAll(true);
		if (list) {
		    Ext.Array.each(list.split(','), function(vmid) {
			var rec = store.findRecord('vmid', vmid);
			if (rec) {
			    sm.select(rec, true);
			}
		    });
		}
	    }
	    insideUpdate = false;
	};

	vmidField.on('change', function(f, value) {
	    var mode = selModeField.getValue();
	    update_vmid_selection(value, mode);
	});

	selModeField.on('change', function(f, value, oldValue) {
	    if (value === 'all') {
		sm.selectAll(true);
		vmgrid.setDisabled(true);
	    } else {
		vmgrid.setDisabled(false);
	    }
	    if (oldValue === 'all') {
		sm.deselectAll(true);
		vmidField.setValue('');
	    }
	    var list = vmidField.getValue();
	    update_vmid_selection(list, value);
	});
		 
	var reload = function() {
	    store.load({
		params: { type: 'vm' },
		callback: function() {
		    var node = nodesel.getValue();
		    store.clearFilter();
		    store.filterBy(function(rec) {
			return (!node || rec.get('node') === node);
		    });
		    var list = vmidField.getValue();
		    var mode = selModeField.getValue();
		    if (mode === 'all') {
			sm.selectAll(true);
		    } else {
			update_vmid_selection(list, mode);
		    }
		}
	    });
	};

        Ext.applyIf(me, {
            subject: gettext("Backup Job"),
            url: url,
            method: method,
	    items: [ ipanel, vmgrid ]
        });

        me.callParent();

        if (me.create) {
	    selModeField.setValue('include');
	} else {
            me.load({
		success: function(response, options) {
		    var data = response.result.data;

		    data.dow = data.dow.split(',');

		    if (data.all || data.exclude) {
			if (data.exclude) {
			    data.vmid = data.exclude;
			    data.selMode = 'exclude';
			} else {
			    data.vmid = '';
			    data.selMode = 'all';
			}
		    } else {
			data.selMode = 'include';
		    }

		    me.setValues(data);
               }
            });
        }

	reload();
    }
});


Ext.define('PVE.dc.BackupView', {
    extend: 'Ext.grid.GridPanel',

    alias: ['widget.pveDcBackupView'],

    allText: '-- ' + gettext('All') + ' --',
    allExceptText: gettext('All except {0}'),

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-cluster-backup',
	    proxy: {
                type: 'pve',
		url: "/api2/json/cluster/backup"
	    }
	});

	var reload = function() {
	    store.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

            var win = Ext.create('PVE.dc.BackupEdit',{
                jobid: rec.data.id
            });
            win.on('destroy', reload);
            win.show();
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor
	});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    confirmMsg: gettext('Are you sure you want to remove this entry'),
	    handler: function(btn, event, rec) {
		PVE.Utils.API2Request({
		    url: '/cluster/backup/' + rec.data.id,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	PVE.Utils.monStoreErrors(me, store);

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    viewConfig: {
		trackOver: false
	    },
	    tbar: [
		{
		    text: gettext('Add'),
		    handler: function() {
			var win = Ext.create('PVE.dc.BackupEdit',{});
			win.on('destroy', reload);
			win.show();
		    }
		},
		remove_btn,
		edit_btn
	    ],		
	    columns: [
		{
		    header: gettext('Node'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'node',
		    renderer: function(value) {
			if (value) {
			    return value;
			}
			return me.allText;
		    }
		},
		{
		    header: gettext('Day of week'),
		    width: 200,
		    sortable: false,
		    dataIndex: 'dow'
		},
		{
		    header: gettext('Start Time'),
		    width: 60,
		    sortable: true,
		    dataIndex: 'starttime'
		},
		{
		    header: gettext('Storage'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'storage'
		},
		{
		    header: gettext('Selection'),
		    flex: 1,
		    sortable: false,
		    dataIndex: 'vmid',
		    renderer: function(value, metaData, record) {
			/*jslint confusion: true */
			if (record.data.all) {
			    if (record.data.exclude) {
				return Ext.String.format(me.allExceptText, record.data.exclude);
			    }
			    return me.allText;
			}
			if (record.data.vmid) {
			    return record.data.vmid;
			}

			return "-";
		    }
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});
	
	me.callParent();
    }
}, function() {

    Ext.define('pve-cluster-backup', {
	extend: 'Ext.data.Model',
	fields: [ 
	    'id', 'starttime', 'dow',
	    'storage', 'node', 'vmid', 'exclude',
	    'mailto',
	    { name: 'all', type: 'boolean' },
	    { name: 'snapshot', type: 'boolean' },
	    { name: 'stop', type: 'boolean' },
	    { name: 'suspend', type: 'boolean' },
	    { name: 'compress', type: 'boolean' }
	]
    });
});/*jslint confusion: true */
Ext.define('PVE.dc.vmHAServiceEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;

	me.create = me.vmid ? false : true;

	if (me.vmid) {
	    me.create = false;
	    me.url = "/cluster/ha/groups/pvevm:" + me.vmid;
	    me.method = 'PUT';
	} else {
	    me.create = true;
	    me.url = "/cluster/ha/groups";
	    me.method = 'POST';
	}

	Ext.apply(me, {
	    subject: gettext('HA managed VM/CT'),
	    width: 350,
	    items: [
		{
		    xtype: me.create ? 'pveVMIDSelector' : 'displayfield',
		    name: 'vmid',
		    validateExists: true,
		    value:  me.vmid || '',
		    fieldLabel: "VM ID"
		},
		{
		    xtype: 'pvecheckbox',
		    name: 'autostart',
		    checked: true,
		    fieldLabel: 'autostart'
		}
	    ]
	});

	me.callParent();

	if (!me.create) {
	    me.load();
	}
    }
});

Ext.define('PVE.dc.HAConfig', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pveDcHAConfig',

    clusterInfo: {}, // reload store data here

    reload: function() {
        var me = this;

	var getClusterInfo = function(conf) {

	    var info = {};

	    if (!(conf && conf.children && conf.children[0])) {
		return info;
	    }

	    var cluster = conf.children[0];

	    if (cluster.text !== 'cluster' || !cluster.config_version) {
		return info;
	    }

	    info.version = cluster.config_version;

	    Ext.Array.each(cluster.children, function(item) {
		if (item.text === 'fencedevices') {
		    // fixme: make sure each node uses at least one fence device
		    info.fenceDevices = true;
		} else if (item.text === 'rm') {
		    info.ha = true;
		}
	    });

	    return info;
	};

	PVE.Utils.API2Request({
	    url: '/cluster/ha/config',
	    waitMsgTarget: me,
	    method: 'GET',
	    failure: function(response, opts) {
		me.clusterInfo = {};
		PVE.Utils.setErrorMask(me, response.htmlStatus);
	    },
	    success: function(response, opts) {
		me.clusterInfo = getClusterInfo(response.result.data);

		me.setDisabled(!me.clusterInfo.version);

		me.addMenu.setDisabled(!me.clusterInfo.version);

		// note: this modifies response.result.data
		me.treePanel.setRootNode(response.result.data);
		me.treePanel.expandAll();


		if (response.result.changes) {
		    me.commitBtn.setDisabled(false);
		    me.revertBtn.setDisabled(false);
		    me.diffPanel.setVisible(true);
		    me.diffPanel.update("<pre>" + Ext.htmlEncode(response.result.changes) + "</pre>");
		} else {
		    me.commitBtn.setDisabled(true);
		    me.revertBtn.setDisabled(true);
		    me.diffPanel.setVisible(false);
		    me.diffPanel.update('');
		}
	    }
	});
    },

    initComponent: function() {
        var me = this;

	me.commitBtn = new PVE.button.Button({
	    text: gettext('Activate'),
	    disabled: true,
	    confirmMsg: function () {
		return gettext('Are you sure you want to activate your changes');
	    },
	    handler: function(btn, event) {
		PVE.Utils.API2Request({
		    url: '/cluster/ha/changes',
		    method: 'POST',
		    waitMsgTarget: me,
		    callback: function() {
			me.reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	me.revertBtn = new PVE.button.Button({
	    text: gettext('Revert changes'),
	    disabled: true,
	    confirmMsg: function () {
		return gettext('Are you sure you want to revert your changes');
	    },
	    handler: function(btn, event) {
		PVE.Utils.API2Request({
		    url: '/cluster/ha/changes',
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			me.reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});

	me.addMenu = new Ext.button.Button({
	    text: gettext('Add'),
	    disabled: true,	    
	    menu: new Ext.menu.Menu({
		items: [
		    {
			text: gettext('HA managed VM/CT'),
			handler: function() {
			    var win = Ext.create('PVE.dc.vmHAServiceEdit', {});
			    win.show();
			    win.on('destroy', me.reload, me);
			}	    
		    },
		    {
			text: gettext('Failover Domain'),
			handler: function() {
			    Ext.Msg.alert(gettext('Error'), "Please configure via CLI");
			}
		    }
		]
	    })
	});

	me.treePanel = Ext.create('Ext.tree.Panel', {
	    rootVisible: false,
	    animate: false,
	    region: 'center',
	    border: false,
	    fields: ['text', 'id', 'vmid', 'name' ],
	    columns: [
		{
		    xtype: 'treecolumn',
		    text: 'Tag',
		    dataIndex: 'text',
		    width: 200
		},
		{ 
		    text: 'Attributes',
		    dataIndex: 'id',
		    renderer: function(value, metaData, record) {
			var text = '';
			Ext.Object.each(record.raw, function(key, value) {
			    if (key === 'id' || key === 'text') {
				return;
			    }
			    text += Ext.htmlEncode(key) + '="' + 
				Ext.htmlEncode(value) + '" '; 
			});
			return text;
		    }, 
		    flex: 1
		}
	    ]
	});

	var run_editor = function() {
	    var rec = me.treePanel.selModel.getSelection()[0];
	    if (rec && rec.data.text === 'pvevm') {
		var win = Ext.create('PVE.dc.vmHAServiceEdit', {
		    vmid: rec.data.vmid
		});
		win.show();
		win.on('destroy', me.reload, me);
	    }
	};

	me.editBtn = new Ext.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    handler: run_editor
	});

	me.removeBtn = new Ext.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    handler: function() {
		var rec = me.treePanel.selModel.getSelection()[0];
		if (rec && rec.data.text === 'pvevm') {
		    var groupid = 'pvevm:' + rec.data.vmid;
		    PVE.Utils.API2Request({
			url: '/cluster/ha/groups/' + groupid,
			method: 'DELETE',
			waitMsgTarget: me,
			callback: function() {
			    me.reload();
			},
			failure: function (response, opts) {
			    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
			}
		    });
		}
	    }
	});


	me.diffPanel = Ext.create('Ext.panel.Panel', {
	    border: false,
	    hidden: true,
	    region: 'south',
	    autoScroll: true,
	    itemId: 'changes',
	    tbar: [ gettext('Pending changes') ],
	    split: true, 
	    bodyPadding: 5,
	    flex: 0.6
	});

	Ext.apply(me, {
	    layout: 'border',
	    tbar: [ me.addMenu, me.removeBtn, me.editBtn, me.revertBtn, me.commitBtn ],
	    items: [ me.treePanel, me.diffPanel ]
	});

	me.callParent();

	me.on('show', me.reload);

	me.treePanel.on("selectionchange", function(sm, selected) {
	    var rec = selected[0];
	    if (rec && rec.data.text === 'pvevm') {
		me.editBtn.setDisabled(false);
		me.removeBtn.setDisabled(false);
	    } else {
		me.editBtn.setDisabled(true);
		me.removeBtn.setDisabled(true);

	    }
	});

	me.treePanel.on("itemdblclick", function(v, record) {
	    run_editor();
	});
    }
});
Ext.define('PVE.dc.Support', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pveDcSupport',

    invalidHtml: '<h1>No valid subscription</h1>' + PVE.Utils.noSubKeyHtml,

    communityHtml: 'Please use the public community <a target="_blank" href="http://forum.proxmox.com">forum</a> for any questions.',

    activeHtml: 'Please use our <a target="_blank" href="https://my.proxmox.com">support portal</a> for any questions. You can also use the public community <a target="_blank" href="http://forum.proxmox.com">forum</a> to get additional information.',

    bugzillaHtml: '<h1>Bug Tracking</h1>Our bug tracking system is available <a target="_blank" href="https://bugzilla.proxmox.com">here</a>.',

    docuHtml: '<h1>Documentation</h1>Complete documentation, tutorials, videos and more is available at our <a target="_blank" href="http://pve.proxmox.com/wiki/Documentation">wiki</a>.',

    updateActive: function(data) {
	var me = this;
	
	var html = '<h1>' + data.productname + '</h1>' + me.activeHtml; 
	html += '<br><br>' + me.docuHtml;
	html += '<br><br>' + me.bugzillaHtml;

	me.update(html);
    },

    updateCommunity: function(data) {
	var me = this;

	var html = '<h1>' + data.productname + '</h1>' + me.communityHtml; 
	html += '<br><br>' + me.docuHtml;
	html += '<br><br>' + me.bugzillaHtml;

	me.update(html);
    },
	 
    updateInactive: function(data) {
	var me = this;
	me.update(me.invalidHtml);
    },

    initComponent: function() {
        var me = this;

	var reload = function() {
	    PVE.Utils.API2Request({
		url: '/nodes/localhost/subscription',
		method: 'GET',
		waitMsgTarget: me,
		failure: function(response, opts) {
		    Ext.Msg.alert('Error', response.htmlStatus);
		    me.update("Unable to load subscription status: " + response.htmlStatus);
		},
		success: function(response, opts) {
		    var data = response.result.data;

		    if (data.status === 'Active') {
			if (data.level === 'c') {
			    me.updateCommunity(data);
			} else {
			    me.updateActive(data);
			}
		    } else {
			me.updateInactive(data);
		    }
		}
	    });
	};

	Ext.apply(me, {
	    autoScroll: true,
	    bodyStyle: 'padding:10px',
	    listeners: {
		show: reload
	    }
	});

	me.callParent();
    }
});Ext.define('PVE.dc.Config', {
    extend: 'PVE.panel.Config',
    alias: 'widget.PVE.dc.Config',

    initComponent: function() {
        var me = this;

	var caps = Ext.state.Manager.get('GuiCap');

	me.items = [];

	Ext.apply(me, {
	    title: gettext("Datacenter"),
	    hstateid: 'dctab'
	});

	if (caps.dc['Sys.Audit']) {
	    me.items.push([
		{
		    title: gettext('Summary'),
		    xtype: 'pveDcSummary',
		    itemId: 'summary'
		},
		{
		    xtype: 'pveDcOptionView',
		    title: gettext('Options'),
		    itemId: 'options'
		}
	    ]);
	}

	if (caps.storage['Datastore.Allocate'] || caps.dc['Sys.Audit']) {
	    me.items.push({
		xtype: 'pveStorageView',
		title: gettext('Storage'),
		itemId: 'storage'
	    });
	}

	if (caps.dc['Sys.Audit']) {
	    me.items.push({
		xtype: 'pveDcBackupView',
		title: gettext('Backup'),
		itemId: 'backup'
	    });
	}

	me.items.push({
	    xtype: 'pveUserView',
	    title: gettext('Users'),
	    itemId: 'users'
	});

	if (caps.dc['Sys.Audit']) {
	    me.items.push([
		{
		    xtype: 'pveGroupView',
		    title: gettext('Groups'),
		    itemId: 'groups'
		},
		{
		    xtype: 'pvePoolView',
		    title: gettext('Pools'),
		    itemId: 'pools'
		},
		{
		    xtype: 'pveACLView',
		    title: gettext('Permissions'),
		    itemId: 'permissions'
		},
		{
		    xtype: 'pveRoleView',
		    title: gettext('Roles'),
		    itemId: 'roles'
		},
		{
		    xtype: 'pveAuthView',
		    title: gettext('Authentication'),
		    itemId: 'domains'
		},
		{
		    xtype: 'pveDcHAConfig',
		    title: 'HA',
		    itemId: 'ha'
		}
	    ]);

	    me.items.push({
		xtype: 'pveDcSupport',
		title: gettext('Support'),
		itemId: 'support'
	    });
	}

	me.callParent();
   }
});
/*
 * Workspace base class
 *
 * popup login window when auth fails (call onLogin handler)
 * update (re-login) ticket every 15 minutes
 *
 */

Ext.define('PVE.Workspace', {
    extend: 'Ext.container.Viewport',

    title: 'Proxmox Virtual Environment',

    loginData: null, // Data from last login call

    onLogin: function(loginData) {},

    // private
    updateLoginData: function(loginData) {
	var me = this;
	me.loginData = loginData;
	PVE.CSRFPreventionToken = loginData.CSRFPreventionToken;
	PVE.UserName = loginData.username;

	if (loginData.cap) {
	    Ext.state.Manager.set('GuiCap', loginData.cap);
	}

	// creates a session cookie (expire = null) 
	// that way the cookie gets deleted after browser window close
	Ext.util.Cookies.set('PVEAuthCookie', loginData.ticket, null, '/', null, true);
	me.onLogin(loginData);
    },

    // private
    showLogin: function() {
	var me = this;

	PVE.Utils.authClear();
	PVE.UserName = null;
	me.loginData = null;

	if (!me.login) {
	    me.login = Ext.create('PVE.window.LoginWindow', {
		handler: function(data) {
		    me.login = null;
		    me.updateLoginData(data);
		    PVE.Utils.checked_command(function() {}); // display subscription status
		}
	    });
	}
	me.onLogin(null);
        me.login.show();
    },

    initComponent : function() {
	var me = this;

	Ext.tip.QuickTipManager.init();

	// fixme: what about other errors
	Ext.Ajax.on('requestexception', function(conn, response, options) {
	    if (response.status == 401) { // auth failure
		me.showLogin();
	    }
	});

	document.title = me.title;

	me.callParent();

        if (!PVE.Utils.authOK()) {
	    me.showLogin();
	} else { 
	    if (me.loginData) {
		me.onLogin(me.loginData);
	    }
	}

	Ext.TaskManager.start({
	    run: function() {
		var ticket = PVE.Utils.authOK();
		if (!ticket || !PVE.UserName) {
		    return;
		}

		Ext.Ajax.request({
		    params: { 
			username: PVE.UserName,
			password: ticket
		    },
		    url: '/api2/json/access/ticket',
		    method: 'POST',
		    success: function(response, opts) {
			var obj = Ext.decode(response.responseText);
			me.updateLoginData(obj.data);
		    }
		});
	    },
	    interval: 15*60*1000
	});

    }
});

Ext.define('PVE.ConsoleWorkspace', {
    extend: 'PVE.Workspace',

    alias: ['widget.pveConsoleWorkspace'],

    title: gettext('Console'),

    initComponent : function() {
	var me = this;

	var param = Ext.Object.fromQueryString(window.location.search);
	var consoleType = me.consoleType || param.console;

	var content;
	if (consoleType === 'kvm') {
	    me.title = "VM " + param.vmid;
	    if (param.vmname) {
		me.title += " ('" + param.vmname + "')";
	    }
	    content = {
		xtype: 'pveKVMConsole',
		vmid: param.vmid,
		nodename: param.node,
		vmname: param.vmname,
		toplevel: true
	    };
	} else if (consoleType === 'openvz') {
	    me.title = "CT " + param.vmid;
	    if (param.vmname) {
		me.title += " ('" + param.vmname + "')";
	    }
	    content = {
		xtype: 'pveOpenVZConsole',
		vmid: param.vmid,
		nodename: param.node,
		vmname: param.vmname,
		toplevel: true
	    };
	} else if (consoleType === 'shell') {
	    me.title = "node '" + param.node + "'";
	    content = {
		xtype: 'pveShell',
		nodename: param.node,
		toplevel: true
	    };
	} else if (consoleType === 'upgrade') {
	    me.title = Ext.String.format(gettext('System upgrade on node {0}'), "'" + param.node + "'");
	    content = {
		xtype: 'pveShell',
		nodename: param.node,
		ugradeSystem: true,
		toplevel: true
	    };
	} else {
	    content = {
		border: false,
		bodyPadding: 10,
		html: 'Error: No such console type' 
	    };
	}

	Ext.apply(me, {
	    layout: { type: 'fit' },
	    border: false,
	    items: [ content ]
	});

	me.callParent();       
    }
});

Ext.define('PVE.StdWorkspace', {
    extend: 'PVE.Workspace',

    alias: ['widget.pveStdWorkspace'],

    // private
    setContent: function(comp) {
	var me = this;
	
	var cont = me.child('#content');
	cont.removeAll(true);

	if (comp) {
	    PVE.Utils.setErrorMask(cont, false);
	    comp.border = false;
	    cont.add(comp);
	    cont.doLayout();
	} 
	// else {
	    // TODO: display something useful

	    // Note:: error mask has wrong zindex, so we do not
	    // use that - see bug 114
	    // PVE.Utils.setErrorMask(cont, 'nothing selected');
	//}
    },

    selectById: function(nodeid) {
	var me = this;
	var tree = me.down('pveResourceTree');
	tree.selectById(nodeid);
    },

    checkVmMigration: function(record) {
	var me = this;
	var tree = me.down('pveResourceTree');
	tree.checkVmMigration(record);
    },

    onLogin: function(loginData) {
	var me = this;

	me.updateUserInfo();

	if (loginData) {
	    PVE.data.ResourceStore.startUpdate();

	    PVE.Utils.API2Request({
		url: '/version',
		method: 'GET',
		success: function(response) {
		    PVE.VersionInfo = response.result.data;
		    me.updateVersionInfo();
		}
	    });
	}
    },

    updateUserInfo: function() {
	var me = this;

	var ui = me.query('#userinfo')[0];

	if (PVE.UserName) {
	    var msg =  Ext.String.format(gettext("You are logged in as {0}"), "'" + PVE.UserName + "'");
	    ui.update('<div class="x-unselectable" style="white-space:nowrap;">' + msg + '</div>');
	} else {
	    ui.update('');
	}
	ui.doLayout();
    },

    updateVersionInfo: function() {
	var me = this;

	var ui = me.query('#versioninfo')[0];

	if (PVE.VersionInfo) {
	    var version = PVE.VersionInfo.version + '-' + PVE.VersionInfo.release + '/' +
		PVE.VersionInfo.repoid;
	    ui.update('<span class="x-panel-header-text">Proxmox Virtual Environment<br>' + gettext('Version') + ': ' + version + "</span>");
	} else {
	    ui.update('<span class="x-panel-header-text">Proxmox Virtual Environment</span>');
	}
	ui.doLayout();
    },

    initComponent : function() {
	var me = this;

	Ext.History.init();

	var sprovider = Ext.create('PVE.StateProvider');
	Ext.state.Manager.setProvider(sprovider);

	var selview = new PVE.form.ViewSelector({});

	var rtree = Ext.createWidget('pveResourceTree', {
	    viewFilter: selview.getViewFilter(),
	    flex: 1,
	    selModel: new Ext.selection.TreeModel({
		listeners: {
		    selectionchange: function(sm, selected) {
			var comp;
			var tlckup = {
			    root: 'PVE.dc.Config',
			    node: 'PVE.node.Config',
			    qemu: 'PVE.qemu.Config',
			    openvz: 'PVE.openvz.Config',
			    storage: 'PVE.storage.Browser',
			    pool: 'pvePoolConfig'
			};
			
			if (selected.length > 0) {
			    var n = selected[0];
			    comp = { 
				xtype: tlckup[n.data.type || 'root'] || 
				    'pvePanelConfig',
				layout: { type: 'fit' },
				showSearch: (n.data.id === 'root') ||
				    Ext.isDefined(n.data.groupbyid),
				pveSelNode: n,
				workspace: me,
				viewFilter: selview.getViewFilter()
			    };
			    PVE.curSelectedNode = n;
			}

			me.setContent(comp);
		    }
		}
	    })
	});

	selview.on('select', function(combo, records) { 
	    if (records && records.length) {
		var view = combo.getViewFilter();
		rtree.setViewFilter(view);
	    }
	});

	var caps = sprovider.get('GuiCap');

	var createVM = Ext.createWidget('button', {
	    pack: 'end',
	    margins: '3 5 0 0',
	    baseCls: 'x-btn',
	    text: gettext("Create VM"),
	    disabled: !caps.vms['VM.Allocate'],
	    handler: function() {
		var wiz = Ext.create('PVE.qemu.CreateWizard', {});
		wiz.show();
	    } 
	});

	var createCT = Ext.createWidget('button', {
	    pack: 'end',
	    margins: '3 5 0 0',
	    baseCls: 'x-btn',
	    text: gettext("Create CT"),
	    disabled: !caps.vms['VM.Allocate'],
	    handler: function() {
		var wiz = Ext.create('PVE.openvz.CreateWizard', {});
		wiz.show();
	    } 
	});

	sprovider.on('statechange', function(sp, key, value) {
	    if (key === 'GuiCap' && value) {
		caps = value;
		createVM.setDisabled(!caps.vms['VM.Allocate']);
		createCT.setDisabled(!caps.vms['VM.Allocate']);
	    }
	});

	Ext.apply(me, {
	    layout: { type: 'border' },
	    border: false,
	    items: [
		{
		    region: 'north',
		    height: 30,
		    layout: { 
			type: 'hbox',
			align : 'middle'
		    },
		    baseCls: 'x-plain',		
		    defaults: {
			baseCls: 'x-plain'			
		    },
		    border: false,
		    margins: '2 0 5 0',
		    items: [
			{
			    margins: '0 0 0 4',
			    html: '<a class="x-unselectable" target=_blank href="http://www.proxmox.com">' +
				'<img height=30 width=209 src="/pve2/images/proxmox_logo.png"/></a>'
			},
			{
			    minWidth: 200,
			    flex: 1,
			    id: 'versioninfo',
			    html: '<span class="x-panel-header-text">Proxmox Virtual Environment</span>'
			},
			{
			    pack: 'end',
			    margins: '8 10 0 10',
			    id: 'userinfo',
			    stateful: false
			},
			{
			    pack: 'end',
			    margins: '3 5 0 0',
			    xtype: 'button',
			    baseCls: 'x-btn',
			    text: gettext("Logout"),
			    handler: function() { 
				PVE.data.ResourceStore.stopUpdate();
				me.showLogin(); 
				me.setContent(); 
				var rt = me.down('pveResourceTree');
				rt.clearTree();
			    }
			}, 
			createVM, 
			createCT
		    ]
		},
		{
		    region: 'center',
		    id: 'content',
		    xtype: 'container',
		    layout: { type: 'fit' },
		    border: false,
		    stateful: false,
		    margins: '0 5 0 0',
		    items: []
		},
		{
		    region: 'west',
		    xtype: 'container',
		    border: false,
		    layout: { type: 'vbox', align: 'stretch' },
		    margins: '0 0 0 5',
		    split: true,
		    width: 200,
		    items: [ selview, rtree ]
		},
		{
		    xtype: 'pveStatusPanel',
		    region: 'south',
		    margins:'0 5 5 5',
		    height: 200,       
		    split:true
		}
	    ]
	});

	me.callParent();

	me.updateUserInfo();
    }
});

