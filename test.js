const dot = require("dot-object");
const mysql = require("./dist/shared/database");
const client = require("../CMS/app/db/mongo/").models["data.client"];

let sql = "ALTER TABLE `test`";

(async () => {
    console.log('here');
    const conn = new mysql.Mysql();
    console.time('test');
    const [result] = await conn.query("SELECT * FROM `test` WHERE `agreement.contactPending.timestamp` LIKE '%GQLUSkvmRBR%' ");
    console.log(result.length);
    console.timeEnd('test');
    console.log('done');

    console.time('test');
    console.log("being");
    await client.find({});
    console.timeEnd('test');
    console.log("end");
    
})();



/*
const isInt = (n) => {
    return n % 1 === 0;
}

const a = {
    "_id": "6204e9cdb5eeeae55056c1fe",
    "agreement.contactPending.state": false,
    "agreement.contactPending.timestamp": "2020-07-07T22:00:00.000Z",
    "agreement.contactPending.ticketIndex": 118315,
    "agreement.person.address.city.name": "Mikołów",
    "agreement.person.address.city.simc": "0941286",
    "agreement.person.address.street.name": "Cypriana Kamila Norwida",
    "agreement.person.address.street.ulic": "31592",
    "agreement.person.address.ownershipKind": "owned",
    "agreement.person.address.zipCode": "43-199",
    "agreement.person.address.houseNumber": "42 i 2a",
    "agreement.person.address.parcelReferenceNumber": "",
    "agreement.person.address.apartmentNumber": "",
    "agreement.person.phoneUsageConsent": true,
    "agreement.person.emailUsageConsent": false,
    "agreement.person.name": "Andrzej",
    "agreement.person.name2": "",
    "agreement.person.surname": "Nowak",
    "agreement.person.surname2": "",
    "agreement.person.mobile": "609858002",
    "agreement.person.phone": "327797776",
    "agreement.person.email": "tk@miconet.pl",
    "agreement.person.pesel": "",
    "agreement.person.pesel2": "",
    "agreement.person.authorizedPerson": "",
    "agreement.person.emailAlt": "",
    "agreement.person.mobileAlt": "",
    "agreement.receiver.address.city.name": "Czarna",
    "agreement.receiver.address.street.name": "asdf",
    "agreement.receiver.address.zipCode": "23-321",
    "agreement.receiver.address.houseNumber": "1",
    "agreement.receiver.address.apartmentNumber": "",
    "agreement.receiver.sameAsPayer": false,
    "agreement.receiver.companyName": "Test",
    "agreement.payer.address.city.name": "Orzesze",
    "agreement.payer.address.street.name": "Pocztowa",
    "agreement.payer.address.zipCode": "43-180",
    "agreement.payer.address.houseNumber": "2",
    "agreement.payer.address.apartmentNumber": "",
    "agreement.payer.sameAsPerson": false,
    "agreement.company.name": "Miconet sp. z o.o.",
    "agreement.company.representative": "",
    "agreement.company.nip": "",
    "agreement.company.regon": "",
    "agreement.company.krs": "",
    "agreement.invoice.send": true,
    "agreement.invoice.email": "tk@miconet.pl",
    "agreement.invoice.password": "",
    "agreement.lease.state": false,
    "agreement.lease.installed": false,
    "agreement.voip.state": false,
    "agreement.voip.installed": false,
    "agreement.voip.tariffName": "B",
    "agreement.voip.secondsDivisor": 30,
    "agreement.voip.fax2mail": false,
    "agreement.voip.installationDate": "2019-10-07T22:00:00.000Z",
    "agreement.voip.terminationDate": "2020-03-25T23:00:00.000Z",
    "agreement.net.state": true,
    "agreement.net.staticIp": false,
    "agreement.net.bundleName": "Złoty GPON Bogaty-1",
    "agreement.net.bundle._id": "626a8c3fe88fcc9884375171",
    "agreement.net.bundle.name": "Złoty GPON Bogaty-1",
    "agreement.net.bundle.downMbps": 300,
    "agreement.net.bundle.upMbps": 30,
    "agreement.net.bundle.netPrice": 1,
    "agreement.net.bundle.tvPrice": 94,
    "agreement.net.bundle.installationPrice": 149,
    "agreement.net.bundle.indefinitePrice": 120,
    "agreement.net.bundle.installationIndefinitePrice": 1899,
    "agreement.net.bundle.availableForConnectionTypeName": "GPON",
    "agreement.net.bundle.availableForService": "net-tv",
    "agreement.net.bundle.tvBundleName": "Wielotematyczny +",
    "agreement.net.bundle.business": false,
    "agreement.vlanTransmission.state": false,
    "agreement.cableLease.state": false,
    "agreement.tv.multiroom.state": false,
    "agreement.tv.multiroom.installed": false,
    "agreement.tv.multiroom.terminationDate": "2022-04-15T00:00:00.000Z",
    "agreement.tv.state": true,
    "agreement.tv.installed": false,
    "agreement.tv.extraBundles": true,
    "agreement.tv.bundleName": "Wielotematyczny +",
    "agreement.tv.extraBundlesTerminationDate": null,
    "agreement.tv.installationDate": null,
    "agreement.tv.terminationDate": "2022-04-01T00:00:00.000Z",
    "agreement.tv.bundle._id": "5d6ff6bc2d93510d8b8e04a9",
    "agreement.tv.bundle.name": "Wielotematyczny +",
    "agreement.tv.bundle.__v": 0,
    "agreement.annex.date": "2022-06-02T12:00:54.164Z",
    "agreement.annex.preparationDate": "2022-06-02T12:00:54.164Z",
    "agreement.annex.oneSideContent": "asfdsfdsasdfdsa",
    "agreement.cession.state": true,
    "agreement.cession.date": "2022-01-12T23:00:00.000Z",
    "agreement.cession.clid": 24129,
    "agreement.accountingType": "invoice",
    "agreement.entersIntoForceOnField": "signDate",
    "agreement.lengthName": "24m-ce",
    "agreement.business": true,
    "agreement.smallBusiness": false,
    "agreement.attribute": "",
    "agreement.notesForAdmins": "router od 2891, 898, 970, 3246, 3013, 891,2978, 2331, 2462, 1553, 1839, 19SELECT `efaktura_email`,`e_mail`  FROM `ss_abonent` WHERE `numer_klienta` = 1000155, 2074, 2573. 2080, 1872, 2806, Mariusz, (2675)Marek, Damian, 3092, 725, 3277, 2258 krzys, 1858,3302, (1803 - Kuba), 14233 (Klimsa)",
    "agreement.notesForBok": ". KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST. KORESP BOK TEST",
    "agreement.additionalArrangements": "promocja dla lojalnych \n\n",
    "agreement.signatory": "Katarzyna Kubicka",
    "agreement.agentName": "",
    "agreement.terminator": "Anna Korabik",
    "agreement.signDate": "2022-06-02T10:00:00.000Z",
    "agreement.preparationDate": "2022-06-02T10:00:00.000Z",
    "agreement.dueDate": "2024-06-02T10:00:00.000Z",
    "agreement.entersIntoForceOnDate": null,
    "agreement.installationDate": "2020-01-16T11:00:00.000Z",
    "agreement.startupDate": "2005-10-15T10:00:00.000Z",
    "agreement.terminationDate": null,
    "fees.mrr.total.amount": 105,
    "fees.mrr.total.indefinite": 120,
    "fees.mrr.total.discount": 2856,
    "fees.mrr.total.discountReturnAmount": 2,
    "fees.mrr.total.customDiscount": 0,
    "fees.mrr.tv.extraBundles.amount": null,
    "fees.mrr.tv.extraBundles.details.0.amount": null,
    "fees.mrr.tv.extraBundles.details.0._id": "6298a624e73f84e64f8d1573",
    "fees.mrr.tv.extraBundles.details.0.name": "Promocja Pakiet Eleven HD na 12 miesięcy",
    "fees.mrr.tv.extraBundles.details.1": null,
    "fees.mrr.tv.extraBundles.details.2.amount": null,
    "fees.mrr.tv.extraBundles.details.2._id": "6298a624e73f84e64f8d1572",
    "fees.mrr.tv.extraBundles.details.2.name": "",
    "fees.mrr.tv.amount": 94,
    "fees.mrr.tv.multiroom": 0,
    "fees.mrr.tv.lease": 0,
    "fees.mrr.net": 1,
    "fees.mrr.voip": 0,
    "fees.mrr.fax2mail": 0,
    "fees.mrr.staticIp": 0,
    "fees.mrr.paymentDay": 10,
    "fees.mrr.custom": [],
    "fees.mrr.linkMaintenance": 10,
    "fees.single.installation.amount": 0,
    "fees.single.installation.discount": 0,
    "fees.single.lease": 0,
    "fees.single.tvActivation": 5,
    "fees.iban._id": "5dbb32b7a8f9bfc89b5db694",
    "fees.iban.clid": 10001,
    "fees.iban.iban": "06 8436 0003 5003 0000 0001 0001",
    "fees.iban.__v": 0,
    "service.monitoring.state": false,
    "service.monitoring.timestamp": "2020-07-07T22:00:00.000Z",
    "service.monitoring.ticketIndex": 124162,
    "service.net.nat.number": 0,
    "service.net.nat.applicable": true,
    "service.net.ppp.state": true,
    "service.net.ppp.login": "pppoe10001@mn",
    "service.net.ppp.password": "kalafior",
    "service.net.radio.accessPointName": "5-SK10-A-CITY",
    "service.net.radio.ip": "10.50.4.5",
    "service.net.radio.accessPoint._id": "5b62e9371ed0916f368fa7a4",
    "service.net.radio.accessPoint.name": "5-SK10-A-CITY",
    "service.net.radio.accessPoint.__v": 0,
    "service.net.staticIp.ip": "",
    "service.net.staticIp.mask": 32,
    "service.net.block.payment": false,
    "service.net.block.admin": false,
    "service.net.block.ignore": false,
    "service.net.block.limitTransfer": false,
    "service.net.radiusIp": "10.50.255.81",
    "service.net.ipv6State": false,
    "service.net.mac": "",
    "service.net.vlan": "0/1/4/1352",
    "service.voip.fax2mail.email": "",
    "service.voip.numbers.0._id": "6298a5f06497f8e61fb990e3",
    "service.voip.numbers.0.number": "48327797888",
    "service.voip.numbers.0.password": "igrl0ALyyCwwr",
    "service.tv.jamboxId": "028163686",
    "service.gpon.config.ethData.0._id": "627fd5d19427410f2a7c04a5",
    "service.gpon.config.ethData.0.ethId": 1,
    "service.gpon.config.ethData.0.ethVlan": 1352,
    "service.gpon.config.ethData.0.ethTag": false,
    "service.gpon.config.ethData.0.ethBridged": false,
    "service.gpon.config.ethData.0.ethIgmp": false,
    "service.gpon.config.ethData.1._id": "627fd5d19427410f2a7c04a4",
    "service.gpon.config.ethData.1.ethId": 2,
    "service.gpon.config.ethData.1.ethVlan": 1352,
    "service.gpon.config.ethData.1.ethTag": false,
    "service.gpon.config.ethData.1.ethBridged": false,
    "service.gpon.config.ethData.1.ethIgmp": false,
    "service.gpon.config.ethData.2._id": "627fd5d19427410f2a7c04a3",
    "service.gpon.config.ethData.2.ethId": 3,
    "service.gpon.config.ethData.2.ethVlan": 570,
    "service.gpon.config.ethData.2.ethTag": false,
    "service.gpon.config.ethData.2.ethBridged": true,
    "service.gpon.config.ethData.2.ethIgmp": true,
    "service.gpon.config.ethData.3._id": "627fd5d19427410f2a7c04a2",
    "service.gpon.config.ethData.3.ethId": 4,
    "service.gpon.config.ethData.3.ethVlan": 570,
    "service.gpon.config.ethData.3.ethTag": false,
    "service.gpon.config.ethData.3.ethBridged": true,
    "service.gpon.config.ethData.3.ethIgmp": true,
    "service.gpon.config.location": "Mikolow_Cypriana_Kamila_Norwida_42",
    "service.gpon.config.name": "10001",
    "service.gpon.config.pppPassword": "kalafior",
    "service.gpon.config.pppUser": "pppoe10001@mn",
    "service.gpon.config.sipComId": 3,
    "service.gpon.config.sipIp": "10.50.230.164",
    "service.gpon.config.sipVlan": 1416,
    "service.gpon.config.wanMode": "ppp",
    "service.gpon.config.wlanData.0._id": "627fd5d19427410f2a7c04a8",
    "service.gpon.config.wlanData.0.wlanId": 1,
    "service.gpon.config.wlanData.0.wlanState": true,
    "service.gpon.config.wlanData.0.wlanVlan": 1352,
    "service.gpon.config.wlanData.0.wlanSsid": "multimetro10001",
    "service.gpon.config.wlanData.0.wlanPassword": "kalafior",
    "service.gpon.config.wlanData.0.wlanChannel": 6,
    "service.gpon.config.wlanData.0.wlanComId": 1,
    "service.gpon.config.wlanData.1._id": "627fd5d19427410f2a7c04a7",
    "service.gpon.config.wlanData.1.wlanId": 2,
    "service.gpon.config.wlanData.1.wlanState": true,
    "service.gpon.config.wlanData.1.wlanSsid": "Multimetro_327797777",
    "service.gpon.config.wlanData.1.wlanComId": 2,
    "service.gpon.config.wlanData.2._id": "627fd5d19427410f2a7c04a6",
    "service.gpon.config.wlanData.2.wlanId": 3,
    "service.gpon.config.wlanData.2.wlanState": true,
    "service.gpon.config.wlanData.2.wlanSsid": "Internet_Telewizja_Telefon",
    "service.gpon.config.wlanData.2.wlanComId": 2,
    "service.gpon.card": 1,
    "service.gpon.cableLength": 0,
    "service.gpon.encName": "GOST-97-PSZCZY361",
    "service.gpon.installationLevel.rx": 0,
    "service.gpon.installationLevel.tx": 0,
    "service.gpon.locationCoords.lat": 0,
    "service.gpon.locationCoords.lng": 0,
    "service.gpon.oltIp": "10.50.239.216",
    "service.gpon.onu": 2,
    "service.gpon.port": 8,
    "service.gpon.enc._id": "628f3f2eb679d0e7e091d55d",
    "service.gpon.enc.name": "GOST-97-PSZCZY361",
    "service.gpon.enc.description": "Mufa na słupie przy budynku Pszczyńska 361",
    "service.gpon.enc.l0Kind": "OTWARTY",
    "service.gpon.enc.l1Kind": "MUFA TRACOM DUZA",
    "service.gpon.enc.coords": "50.1059724087695,18.8834246993",
    "service.gpon.enc.__v": 0,
    "service.gpon.olt._id": "5b71c4709606d1dba8e5fde8",
    "service.gpon.olt.name": "10.50.239.216 - JELUX",
    "service.gpon.olt.ip": "10.50.239.216",
    "service.gpon.olt.vlanNet1": 1351,
    "service.gpon.olt.vlanNet2": 1352,
    "service.gpon.olt.vlanTv": 570,
    "service.gpon.olt.vlanMng": 1416,
    "service.gpon.olt.type": "zhone",
    "service.gpon.olt.snmpCommunity": "public",
    "service.gpon.olt.disabled": false,
    "service.connectionTypeName": "GPON",
    "service.managementIp": "10.50.230.164",
    "service.connectionType._id": "5b04040c7f3ebf1ec9102959",
    "service.connectionType.name": "GPON",
    "service.connectionType.__v": 0,
    "statusName": "I",
    "fileList": [],
    "timestamp": "2022-02-23T02:01:06.415Z",
    "userstamp": "CMS",
    "ebok.password": "492629",
    "ebok.toReset": false,
    "__v": 0,
    "status._id": "5e83cc2af3fef2d6646f053f",
    "status.name": "I",
    "status.description": "Instalacja"
};

const obj = {};
for (let key in a) {
    if (/\.[0-9]/.test(key)) {
        continue;
    }
    const val = a[key] === null || Array.isArray(a[key]) ? "null" : a[key];
    const type = typeof val;
    const typeMap = {
        "number": isInt(val) ? "INT" : "FLOAT",
        "string": "TEXT",
        "boolean": "BOOLEAN"
    };
    if (!typeMap[type]) {
        console.log(type, " not found", val);
        process.exit();
    }
    obj[key] = val;
    sql += ` ADD \`${key}\` ${typeMap[type]} NOT NULL,`;
}

function readableRandomStringMaker(length) {
    for (var s = ''; s.length < length; s += ' abcdefgh ijklmnopqrs tuvwxyzABCDEFGH IJKLMNOPQRSTUVWXY Z0123456789'.charAt(Math.random() * 66 | 0));
    return s;
}


(async () => {
    for (let i = 0; i <= 10000; i++) {
        const tmp = {};
        let insert = "INSERT INTO test (";
        for (let key in obj) {
            const type = typeof obj[key];
            if (type === "number") {
                val = Math.floor(Math.random() * 100000);
            } else if (type === "string") {
                val = readableRandomStringMaker(Math.floor(Math.random() * 100));
            } else if (type === "boolean") {
                val = Number(Math.floor(Math.random() * 2));
            } else {
                console.log("wrong val", val);
                process.exit();
            }
            tmp[key] = val;
            insert += `\`${key}\`,`;
        }
        insert = insert.substring(0, insert.length - 1);
        insert += ") VALUES (";
        for (let key in tmp) {
            const type = typeof tmp[key];
            if (type === "number") {
                insert += tmp[key];
            } else if (type === "string") {
                insert += `"${tmp[key]}"`;
            } else if (type === "boolean") {
                insert += tmp[key];
            } else {
                console.log("wrong val", val);
                process.exit();
            }
            insert += ",";
        }
        insert = insert.substring(0, insert.length - 1);
        insert += ")";
        await conn.query(insert);
        console.log(i);
    }
})();


conn.query("SELECT 1").then((result) => {
    //console.log(result);
});

//console.log(`\n${sql}`*/