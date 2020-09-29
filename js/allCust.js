;(function() {
"use strict";

String.prototype.capCase = function () {
    return this.slice(0, 1).toUpperCase() + this.slice(1).toLowerCase();
}

const ra = a => {
    return a[Math.floor(Math.random() * a.length)]
},
    v = new Vue({
        data: {
            working: true,
            nameList: [],
            races: [{
                name: 'Asura',
                class: 'is-link',
                fn: 'genAsura'
            }, {
                name: 'Charr',
                class: 'is-danger',
                fn: 'getCharr'
            }, {
                name: 'Human',
                class: 'is-warning',
                fn: 'getHuman'
            }, {
                name: 'Norn',
                class: 'is-info',
                fn: 'getNorn'
            }, {
                name: 'Sylvari',
                class: 'is-success',
                fn: 'getSylvari'
            }],
            selectedRace: -1,
            numNames: 10,
            nationalities:['English', 'German', 'Danish', 'Scots'],
            selectedGender:false
        },
        methods: {
            getNames() {
                if (this.selectedRace == -1) {
                    return false;
                }
                this[this.races[this.selectedRace].fn]();
            },
            async getSylvari() {
                this.nameList = [];
                this.working=true;
                const sylNames = [...sylvari.names];
                const wikiNames = await this.fetchNames('Irish',true);
                console.log('wikinames!',wikiNames)
                sylNames.push(...wikiNames.map(q=>({name:q,gender:null})));
                for (let i = 0; i < this.numNames; i++) {
                    let name = ra(sylNames);
                    console.log('picked name was',name)
                    this.nameList.push({
                        name: name.name,
                        title: Math.random() > 0.3 ? ra(sylvari.titles) : null,
                        notes: {
                            gender: name.gender
                        }
                    })
                }
                this.working=false;
            },
            getCNLast() {
                //get a charr-style name for both norn & charr
                return ra(charr.nouns) + ra(charr.agents);
            },
            getNorn() {
                this.nameList = [];
                for (let i = 0; i < this.numNames; i++) {
                    // let fn = ra(norn.names),
                    //     n = {
                    //         name: fn + ' ' + this.getCNLast(),
                    //         notes: {}
                    //     }
                    // if (fn.endsWith('a') && fn != 'Agrippa') {
                    //     n.notes.gender='female'
                    // }else{
                    //     n.notes.gender='male'
                    // }
                    // this.nameList.push(n)
                    let n = {
                        name: null,
                        notes: {
                            gender: Math.random() > 0.5 ? 'male' : 'female'
                        }
                    }
                    n.name = ra(norn.names[n.notes.gender]) + ' ';
                    if (Math.random() > 0.5) {
                        n.name += this.getCNLast();
                    } else {
                        let parentGender = Math.random() > 0.5 ? 'male' : 'female',
                            parentName = ra(norn.names[parentGender]);
                        n.name+=parentName;
                        if(Math.random()>0.5){
                            n.name+='s';
                        }
                        if (Math.random()>0.5){
                            n.name+=`kin`;
                        }else if(n.notes.gender == 'male') {
                            n.name+=`son`;
                        }else{
                            n.name+=`dottir`;
                        }
                    }
                    this.nameList.push(n);
                }
            },
            getCharr() {
                this.nameList = [];
                for (let i = 0; i < this.numNames; i++) {
                    let fn = ra(charr.praenomen),
                        n = {
                            name: fn + ' ' + this.getCNLast(),
                            notes: {}
                        }
                    if (fn.endsWith('a') && fn != 'Agrippa') {
                        n.notes.gender = 'female'
                    } else {
                        n.notes.gender = 'male'
                    }
                    this.nameList.push(n)
                }
            },
            async getHuman() {
                this.nameList = [];
                this.working=true;
                const givenNat = ra(this.nationalities),
                    surNat = ra(this.nationalities);
                console.log('getting names with',givenNat,'first name and',surNat,'last name!')
                const fns = await this.fetchNames(givenNat,true);
                const lns = await this.fetchNames(surNat,false);
                for(let i=0;i<this.numNames;i++){
                    this.nameList.push({
                        name:ra(fns)+' '+ra(lns),
                        notes:{
                            gender:!this.selectedGender?'male':'female'
                        }
                    })
                }
                this.working=false;
                // for (let i=0;i<this.numNames;i++){
                //     this.nameList.push(`${ra(sylvari.titles)} ${ra(sylvari.names)}`)
                // }
            },
            fetchNames(nationality,isGiven){
                let baseUrl = `https://en.wiktionary.org/w/api.php?action=query&list=categorymembers&format=json&cmlimit=450&cmtitle=Category:${nationality}_`,
                    names = [];
                if(!!isGiven){
                    baseUrl+=(!this.selectedGender?'male':'female')+'_given_names'
                }else{
                    baseUrl+='_surnames';
                }
                return new Promise((resolve,reject)=>{
                    function loopy(url,cont){
                        let thisUrl =url;
                        if(!!cont){
                            thisUrl+='&cmcontinue='+cont;
                        }
                        thisUrl+='&origin=*';
                        fetch(thisUrl).then(r=>r.json()).then(rj=>{
                            names.push(...rj.query.categorymembers.filter(q=>q.ns===0).map(q=>q.title));
                            if(rj.continue && rj.continue.cmcontinue){
                                loopy(url,rj.continue.cmcontinue);
                            }else{
                                //th th that's all folks
                                resolve(names);
                            }
                        })
                    }
                    loopy(baseUrl);
                })
            },
            genAsura() {
                this.nameList = [];
                const tempNameList = [],
                    asuraProms = [];
                const firstCons = asura.clusts.concat(asura.cons.map(q => q.toUpperCase()));
                for (let i = 0; i < this.numNames; i++) {
                    let name = `${ra(firstCons)}${ra(asura.vows)}${ra(asura.cons)}`;
                    if (Math.random() > 0.5) {
                        name += name[name.length - 1];
                    }
                    if (Math.random() > 0.5) {
                        name += ra(asura.vows);
                    }
                    tempNameList.push(name);
                    asuraProms.push(fetch('https://en.wiktionary.org/w/api.php?action=query&format=json&titles=' + name.toLowerCase() + '&origin=*', {}).then(r => r.json()))
                }
                //https://en.wiktionary.org/w/api.php?action=query&format=json&titles=<NAME>
                console.log(tempNameList)
                Promise.all(asuraProms).then(r => {
                    // r.map(q=>q.query.pages)
                    r.forEach(n => {
                        const pages = n.query.pages,
                            page = Object.keys(pages)[0],
                            nameObj = {
                                name: pages[page].title.capCase(), notes: {
                                    isWord: false
                                }
                            };
                        console.log('nameObj', nameObj, 'page', page, 'pages', pages)
                        if (page != -1) {
                            //IS a word
                            nameObj.notes.isWord = true;
                        }
                        if (Math.random() > 0.5) {
                            //add title
                            nameObj.title = ra(asura.titles);
                        }
                        if (['a', 'i', 'y'].includes(nameObj.name[nameObj.name.length - 1])) {
                            // console.log(nameObj.name,'likely female!')
                            nameObj.notes.gender = 'female';
                        } else {
                            nameObj.notes.gender = 'male';
                        }
                        this.nameList.push(nameObj)
                    })
                })
            },
        },
        created() {
            this.working=false;
         }
    }).$mount('#main')
const asura = {
    //594,000 Asura names
    cons: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'y', 'x', 'z'],
    vows: ['a', 'e', 'i', 'o', 'u', 'y'],
    clusts: ['St', 'Pl', 'Sc', 'Pr', 'Sn', 'Ch', 'Sn', 'Tr', 'Wh', 'Sm', 'Sh', 'Fl', 'Al'],
    titles: ['Explorer', 'Technologist', 'Aetheromancer', 'Warmaster', 'Steward', 'Agent', 'Analyst', 'Apprentice', 'Researcher', 'Gustomancer', 'Assistant', 'Crusader', 'Councilor', 'Magister', 'Organizer']
}
//unfortunately, there is no set formula for charr, norn, sylvari, and human names. So we just gotta list a lot of em and randomize combos
const charr = {
    //816,354 Charr names
    praenomen: ['Ajax', 'Almora', 'Aelia', 'Aeliana', 'Aelianus', 'Aelius', 'Aemilia', 'Aemiliana', 'Aetius', 'Agrippa', 'Rip', 'Jaw', 'Agrippina', 'Alba', 'Albus', 'Ahenobarbus', 'Abanus', 'Albina', 'Albinus', 'Appius', 'Aquila', 'Atilius', 'Austa', 'Augusta', 'Augustus', 'Aulus', 'Aurelius', 'Aureus', 'Aureliana', 'Avilius', 'Avitus', 'Avita', 'Balbus', 'Blasius', 'Brutus', 'Caecilia', 'Caelia', 'Caelius', 'Cato', 'Cicero', 'Cloelia', 'Cloelius', 'Cnaeus', 'Cneaea', 'Crispus', 'Crispa', 'Decima', 'Decimus', 'Domitia', 'Domitius', 'Drusa', 'Drusus', 'Fabia', 'Fabius', 'Fausta', 'Nex', 'Felix', 'Festus', 'Festa', 'Flavia', 'Flavius', 'Gaius', 'Gaia', 'Gallus', 'Gnaeus', 'Gnaea', 'Galena', 'Hilarius', 'Laurentia', 'Laurentius', 'Livia', 'Livius', 'Lupa', 'Manlius', 'Manlia', 'Marcellus', 'Marcia', 'Marcius', 'Maxima', 'Naevius', 'Navia', 'Nero', 'Otho', 'Octavius', 'Octavia', 'Incontinentia', 'Plinius', 'Plinia', 'Pontius', 'Pontia', 'Prisca', 'Priscus', 'Prius', 'Quintus', 'Quinta', 'Quintilla', 'Quintillus', 'Regula', 'Regulus', 'Rufus', 'Rufa', 'Scaevola', 'Scaevolus', 'Seneca', 'Septima', 'Septimus', 'Severus', 'Severa', 'Tatius', 'Tatia', 'Tulia', 'Tulius', 'Valeria', 'Valerius', 'Vibius', 'Vibia', 'Ballista', 'Ballistus', 'Bane', 'Aynna', 'Azalus', 'Attus', 'Auctor', 'Caeva', 'Caevus', 'Dexa', 'Dexus', 'Ayylmao', 'Beata', 'Beatus', 'Beala', 'Bealus', 'Quoba'],
    nouns: ['Burn', 'Kill', 'Strike', 'Claw', 'Tower', 'Ogre', 'Lash', 'Tail', 'Fur', 'Jaw', 'Heart', 'Soul', 'Bite', 'Meat', 'Gore', 'Vital', 'Anvil', 'Burn', 'Ash', 'Iron', 'Hammer', 'Breath', 'Paw', 'Shatter', 'Sword', 'Axe', 'Hammer', 'Blade', 'Smoke', 'Skin', 'Blood', 'Bane', 'Fire', 'Tooth', 'Snarl', 'Gear', 'Grease', 'Steel', 'True', 'Brim', 'Stone', 'Burst', 'Count', 'Trap', 'Net', 'Gnash', 'Flesh', 'Light', 'Cuddly', 'Black', 'Red', 'White', 'Gut', 'Quick', 'Scale', 'Brush', 'Snap', 'Dagger', 'Guzzle', 'Maw', 'Maul', 'Fiend', 'Boom', 'Clever', 'Cleaver', 'Bum'],
    agents: ['crusher', 'fixer', 'skimmer', 'keeper', 'breaker', 'cracker', 'grabber', 'reaver', 'splitter', 'mauler', 'hunter', 'chaser', 'caller', 'bender', 'eater', 'maker', 'razer', 'pincher', 'stealer', 'whacker', 'stalker', 'prowler', 'splitter', 'shaper', 'finder', 'render', 'welder']
}
const norn = {
    //1,155,932 Norn names
    names: {
        // both: ['Calder', 'Carr', 'Helle', 'Jari', 'Vali', 'Uffe'],
        male: ['Ake', 'Arvid', 'Asger', 'Aslog', 'Asmund', 'Audun', 'Balder', 'Birger', 'Braham', 'Bjarl', 'Bjarke', 'Bjarni', 'Bjarte', 'Bjorn', 'Bodil', 'Brandt', 'Brant', 'Brynjar', 'Calder', 'Canute', 'Colby', 'Colden', 'Corey', 'Crosby', 'Dag', 'Dagfinn', 'Dagny', 'Egil', 'Einar', 'Epik', 'Eineride', 'Eirik', 'Elof', 'Eluf', 'Endre', 'Erland', 'Erlend', 'Erling', 'Fiske', 'Folke', 'Fritjof', 'Brinholf', 'Geir', 'Gerd', 'Gudbrand', 'Gudmund', 'Gulbrand', 'Gunborg', 'Gunnar', 'Gunvor', 'Gustav', 'Hackett', 'Hagen', 'Hakon', 'Haldor', 'Halstein', 'Halvar', 'Halvard', 'Halvdan', 'Halvrik', 'Halvor', 'Haskell', 'Havardr', 'Helle', 'Herleif', 'Herliefr', 'Hjalmar', 'Holger', 'Holmes', 'Ingfred', 'Ingolf', 'Forkeyin', 'Ingvar', 'Ivar', 'Jari', 'Jerk', 'Jerrik', 'Jorunn', 'Keld', 'Kjell', 'Latham', 'Leif', 'Loki', 'Erik', 'Magnus', 'Magni', 'Manning', 'Oili', 'Olaf', 'Olavo', 'Olin', 'Olle', 'Olsen', 'Oluf', 'Ove', 'Oydis', 'Ragna', 'Ragnhild', 'Ralph', 'Runa', 'Sigrid', 'Sigrun', 'Sigurd', 'Siri', 'Siv', 'Soini', 'Solveig', 'Stein', 'Steiner', 'Sten', 'Stig', 'Sveinn', 'Sven', 'Thorsen', 'Thorsten', 'Thorvaldr', 'Thurston', 'Torben', 'Torbjorn', 'Torborg', 'Toril', 'Torsten', 'Torvald', 'Troels', 'Tue', 'Tyr', 'Uffe', 'Ulf', 'Uhm', 'Vali', 'Vidar'],
        female: [
            'Alfhild', 'Alva', 'Alvilda', 'Anna',
            'Ana', 'Audhild', 'Bergljot', 'Borghild',
            'Brenda', 'Brenna', 'Calder', 'Carr',
            'Colborn', 'Eerika', 'Eerikki', 'Jormi',
            'Eira', 'Embla', 'Booka', 'Erika',
            'Eydis', 'Fayle', 'Freja', 'Frey',
            'Elsa', 'Elseif', 'Gosta', 'Gunhild',
            'Gunilla', 'Gunne', 'Gyda', 'Hege',
            'Helga', 'Helka', 'Hella', 'Helle',
            'Hertha', 'Hillevi', 'Inge', 'Ingeborg',
            'Ingemar', 'Inger', 'Ingrid', 'Inkeri',
            'Jari', 'Jonni', 'Kari', 'Olavi',
            'Olga', 'Thyra', 'Torhild', 'Tyra',
            'Uffe', 'Vali', 'Ylva'
        ]
    }
}
const sylvari = {
    //6700 Sylvari names
    names: [{ name: "Aberthol", gender: null }, { name: "Adda", gender: null }, { name: "Aeron", gender: null }, { name: "Afan", gender: null }, { name: "Aidan", gender: null }, { name: "Alan", gender: null }, { name: "Aled", gender: null }, { name: "Alun", gender: null }, { name: "Alwyn", gender: null }, { name: "Amhar", gender: null }, { name: "Amlawdd", gender: null }, { name: "Amlodd", gender: null }, { name: "Amren", gender: null }, { name: "Amynedd", gender: null }, { name: "Andreas", gender: null }, { name: "Aneirin", gender: null }, { name: "Aneurin", gender: null }, { name: "Anwas", gender: null }, { name: "Anwill", gender: null }, { name: "Anwir", gender: null }, { name: "Anwyl", gender: null }, { name: "Anyon", gender: null }, { name: "Ap", gender: null }, { name: "Arawn", gender: null }, { name: "Arfon", gender: null }, { name: "Arnall", gender: null }, { name: "Aron", gender: null }, { name: "Arthur", gender: null }, { name: "Arthwr", gender: null }, { name: "Artur", gender: null }, { name: "Arwel", gender: null }, { name: "Arwyn", gender: null }, { name: "Awstin", gender: null }, { name: "Badan", gender: null }, { name: "Baddon", gender: null }, { name: "Baeddan", gender: null }, { name: "Baglen", gender: null }, { name: "Barri", gender: null }, { name: "Bedo", gender: null }, { name: "Bedwyr", gender: null }, { name: "Bedyw", gender: null }, { name: "Beinon", gender: null }, { name: "BeliMawr", gender: null }, { name: "Berian", gender: null }, { name: "Berwyn", gender: null }, { name: "Bevan", gender: null }, { name: "Bevin", gender: null }, { name: "Bleddyn", gender: null }, { name: "Bradwen", gender: null }, { name: "Bradwr", gender: null }, { name: "Brychan", gender: null }, { name: "Bryn", gender: null }, { name: "Bryne", gender: null }, { name: "Brynmor", gender: null }, { name: "Brys", gender: null }, { name: "Bwlch", gender: null }, { name: "Cadarn", gender: null }, { name: "Cadawg", gender: null }, { name: "Cadel", gender: null }, { name: "Cadell", gender: null }, { name: "Cadfael", gender: null }, { name: "Cadman", gender: null }, { name: "Cadog", gender: null }, { name: "Cadwaladr", gender: null }, { name: "Cadwallen", gender: null }, { name: "Cadwgan", gender: null }, { name: "Cadwgawn", gender: null }, { name: "Cadwy", gender: null }, { name: "CaerLlion", gender: null }, { name: "Caerau", gender: null }, { name: "Caerwyn", gender: null }, { name: "Cai", gender: null }, { name: "Caithe", gender: null }, { name: "Caio", gender: null }, { name: "Calcas", gender: null }, { name: "Caledfwlch", gender: null }, { name: "Camedyr", gender: null }, { name: "Caradawg", gender: null }, { name: "Caradoc", gender: null }, { name: "Caradog", gender: null }, { name: "Carian", gender: null }, { name: "Caron", gender: null }, { name: "Carwyn", gender: null }, { name: "Caswallawn", gender: null }, { name: "Cayo", gender: null }, { name: "Cedrik", gender: null }, { name: "Cedwyn", gender: null }, { name: "Cefni", gender: null }, { name: "Celyn", gender: null }, { name: "Cennydd", gender: null }, { name: "Cenwyn", gender: null }, { name: "Ceredig", gender: null }, { name: "Ceri", gender: null }, { name: "Cled", gender: null }, { name: "Cledwyn", gender: null }, { name: "Cranog", gender: null }, { name: "Crwys", gender: null }, { name: "Custenhin", gender: null }, { name: "Cybi", gender: null }, { name: "Cymry", gender: null }, { name: "Cynbel", gender: null }, { name: "Cynedyr", gender: null }, { name: "Cynog", gender: null }, { name: "Cynychwr", gender: null }, { name: "Dafydd", gender: null }, { name: "Dai", gender: null }, { name: "Darren", gender: null }, { name: "Deiniol", gender: null }, { name: "Delwin", gender: null }, { name: "Delwyn", gender: null }, { name: "Derec", gender: null }, { name: "Derfel", gender: null }, { name: "Deri", gender: null }, { name: "Derwen", gender: null }, { name: "Derwyn", gender: null }, { name: "Dewey", gender: null }, { name: "Dewi", gender: null }, { name: "Dirrnyg", gender: null }, { name: "Dremidydd", gender: null }, { name: "Drystan", gender: null }, { name: "Drywsone", gender: null }, { name: "Dyfan", gender: null }, { name: "Dyfed", gender: null }, { name: "Dyfi", gender: null }, { name: "Dyfri", gender: null }, { name: "Dyfrug", gender: null }, { name: "Dylan", gender: null }, { name: "Dywel", gender: null }, { name: "Edryd", gender: null }, { name: "Edwyn", gender: null }, { name: "Efrog", gender: null }, { name: "Eifion", gender: null }, { name: "Einian", gender: null }, { name: "Eirwyn", gender: null }, { name: "Elfyn", gender: null }, { name: "Elgan", gender: null }, { name: "Elgar", gender: null }, { name: "Elis", gender: null }, { name: "Elwyn", gender: null }, { name: "Emhyr", gender: null }, { name: "Emlyn", gender: null }, { name: "Emrys", gender: null }, { name: "Emyr", gender: null }, { name: "Ergyriad", gender: null }, { name: "Ermid", gender: null }, { name: "Erwin", gender: null }, { name: "Eryi", gender: null }, { name: "Eudav", gender: null }, { name: "Eurion", gender: null }, { name: "Evrawg", gender: null }, { name: "Fychan", gender: null }, { name: "Garanhon", gender: null }, { name: "Garanwyn", gender: null }, { name: "Gareth", gender: null }, { name: "Garnoc", gender: null }, { name: "Garth", gender: null }, { name: "Garwyli", gender: null }, { name: "Gawain", gender: null }, { name: "Geraint", gender: null }, { name: "Gerallt", gender: null }, { name: "Gerwyn", gender: null }, { name: "Gethin", gender: null }, { name: "Gilvaethwy", gender: null }, { name: "Glanmor", gender: null }, { name: "Glyn", gender: null }, { name: "Glynn", gender: null }, { name: "Goreu", gender: null }, { name: "Goronwy", gender: null }, { name: "Govannon", gender: null }, { name: "Gowyr", gender: null }, { name: "Griff", gender: null }, { name: "Griffeth", gender: null }, { name: "Griffith", gender: null }, { name: "Gruddyeu", gender: null }, { name: "Gruffin", gender: null }, { name: "Gruffudd", gender: null }, { name: "Gruffydd", gender: null }, { name: "Grufudd", gender: null }, { name: "Guto", gender: null }, { name: "Gwalchmai", gender: null }, { name: "Gwalchmei", gender: null }, { name: "Gwallawg", gender: null }, { name: "Gwallter", gender: null }, { name: "Gwaun", gender: null }, { name: "Gwawl", gender: null }, { name: "Gwayne", gender: null }, { name: "Gweir", gender: null }, { name: "Gwenallt", gender: null }, { name: "Gwent", gender: null }, { name: "Gwenwynwyn", gender: null }, { name: "Gwern", gender: null }, { name: "Gwili", gender: null }, { name: "Gwilym", gender: null }, { name: "Gwion", gender: null }, { name: "Gwres", gender: null }, { name: "Gwri", gender: null }, { name: "Gwydion", gender: null }, { name: "Gwydyon", gender: null }, { name: "Gwyn", gender: null }, { name: "Gwyndaf", gender: null }, { name: "Gwynfor", gender: null }, { name: "Gwyngad", gender: null }, { name: "Gwynlais", gender: null }, { name: "Gwynn", gender: null }, { name: "Harri", gender: null }, { name: "Hedd", gender: null }, { name: "Heddwyn", gender: null }, { name: "Hefin", gender: null }, { name: "Heilyn", gender: null }, { name: "Heini", gender: null }, { name: "Hopcyn", gender: null }, { name: "Howel", gender: null }, { name: "Huarwar", gender: null }, { name: "Hueil", gender: null }, { name: "Huw", gender: null }, { name: "Huwcyn", gender: null }, { name: "Hywel", gender: null }, { name: "Iago", gender: null }, { name: "Ianto", gender: null }, { name: "Iau", gender: null }, { name: "Iddawg", gender: null }, { name: "Idris", gender: null }, { name: "Idwal", gender: null }, { name: "Iestyn", gender: null }, { name: "Ieuan", gender: null }, { name: "Ifan", gender: null }, { name: "Ifor", gender: null }, { name: "Ioan", gender: null }, { name: "Iolo", gender: null }, { name: "Iorath", gender: null }, { name: "Iorwerth", gender: null }, { name: "Iorweth", gender: null }, { name: "Irfon", gender: null }, { name: "Islwyn", gender: null }, { name: "Iver", gender: null }, { name: "Ivor", gender: null }, { name: "Iwan", gender: null }, { name: "Jac", gender: null }, { name: "Jesstin", gender: null }, { name: "Kenyon", gender: null }, { name: "Kerwin", gender: null }, { name: "Kerwyn", gender: null }, { name: "Kyffin", gender: null }, { name: "Kyledyr", gender: null }, { name: "Kynwyl", gender: null }, { name: "Lewys", gender: null }, { name: "Llacheu", gender: null }, { name: "Llassar", gender: null }, { name: "Lleu", gender: null }, { name: "Llew", gender: null }, { name: "Llewellyn", gender: null }, { name: "Llion", gender: null }, { name: "Llwyd", gender: null }, { name: "Llyr", gender: null }, { name: "Llywelyn", gender: null }, { name: "Luc", gender: null }, { name: "Lyn", gender: null }, { name: "Mabon", gender: null }, { name: "Mabsant", gender: null }, { name: "Macsen", gender: null }, { name: "Maddock", gender: null }, { name: "Madog", gender: null }, { name: "Mael", gender: null }, { name: "Maelgwyn", gender: null }, { name: "Maelog", gender: null }, { name: "Maelon", gender: null }, { name: "Maelor", gender: null }, { name: "Mal", gender: null }, { name: "Maldwyn", gender: null }, { name: "Marc", gender: null }, { name: "Maredudd", gender: null }, { name: "Martyn", gender: null }, { name: "Medwyn", gender: null }, { name: "Medyr", gender: null }, { name: "Meic", gender: null }, { name: "Meilir", gender: null }, { name: "Meilyg", gender: null }, { name: "Meilyr", gender: null }, { name: "Meirion", gender: null }, { name: "Mercher", gender: null }, { name: "Meredith", gender: null }, { name: "Meredudd", gender: null }, { name: "Meredydd", gender: null }, { name: "Merfyn", gender: null }, { name: "Meridith", gender: null }, { name: "Merion", gender: null }, { name: "Merlin", gender: null }, { name: "Mervyn", gender: null }, { name: "Merwyn", gender: null }, { name: "Meurig", gender: null }, { name: "Mihangel", gender: null }, { name: "Morcan", gender: null }, { name: "Moren", gender: null }, { name: "Morgan", gender: null }, { name: "Morlais", gender: null }, { name: "Morthwyl", gender: null }, { name: "Morys", gender: null }, { name: "Myrddin", gender: null }, { name: "Myrddyn", gender: null }, { name: "Neifion", gender: null }, { name: "Nerthach", gender: null }, { name: "Newyddilyn", gender: null }, { name: "Niclas", gender: null }, { name: "Ninian", gender: null }, { name: "Nudd", gender: null }, { name: "Ofydd", gender: null }, { name: "Osian", gender: null }, { name: "Oswallt", gender: null }, { name: "Owain", gender: null }, { name: "Owein", gender: null }, { name: "Owen", gender: null }, { name: "Owin", gender: null }, { name: "Padrig", gender: null }, { name: "Pawl", gender: null }, { name: "Pedr", gender: null }, { name: "Pennant", gender: null }, { name: "Penvro", gender: null }, { name: "Phylip", gender: null }, { name: "Powell", gender: null }, { name: "Preece", gender: null }, { name: "Price", gender: null }, { name: "Pryderi", gender: null }, { name: "Prydwen", gender: null }, { name: "Prys", gender: null }, { name: "Reece", gender: null }, { name: "Reese", gender: null }, { name: "Rhain", gender: null }, { name: "Rhion", gender: null }, { name: "Rhisiart", gender: null }, { name: "Rhobat", gender: null }, { name: "Rhobert", gender: null }, { name: "Rhodri", gender: null }, { name: "Rhun", gender: null }, { name: "Rhychdir", gender: null }, { name: "Rhydian", gender: null }, { name: "Rhydwyn", gender: null }, { name: "Rhys", gender: null }, { name: "Robat", gender: null }, { name: "Rodric", gender: null }, { name: "Saer", gender: null }, { name: "Saith", gender: null }, { name: "Samlet", gender: null }, { name: "Sawel", gender: null }, { name: "Seimon", gender: null }, { name: "Seith", gender: null }, { name: "Selwyn", gender: null }, { name: "Seth", gender: null }, { name: "Siams", gender: null }, { name: "Siarl", gender: null }, { name: "Siawn", gender: null }, { name: "Sion", gender: null }, { name: "Sioni", gender: null }, { name: "Steffan", gender: null }, { name: "Steffon", gender: null }, { name: "Sulwyn", gender: null }, { name: "Syvwlch", gender: null }, { name: "Talfryn", gender: null }, { name: "Taliesin", gender: null }, { name: "Tecwyn", gender: null }, { name: "Teifion", gender: null }, { name: "Teilo", gender: null }, { name: "Telor", gender: null }, { name: "Terfel", gender: null }, { name: "Tewdwr", gender: null }, { name: "Tomi", gender: null }, { name: "Tomos", gender: null }, { name: "Trahaearn", gender: null }, { name: "Trefor", gender: null }, { name: "Tristan", gender: null }, { name: "Tristram", gender: null }, { name: "Tristyn", gender: null }, { name: "Trystan", gender: null }, { name: "Tudful", gender: null }, { name: "Tudor", gender: null }, { name: "Tudur", gender: null }, { name: "Twm", gender: null }, { name: "Twrgadarn", gender: null }, { name: "Uchdryd", gender: null }, { name: "Vaddon", gender: null }, { name: "Watcyn", gender: null }, { name: "Wil", gender: null }, { name: "Wmffre", gender: null }, { name: "Wyn", gender: null }, { name: "Wynford", gender: null }, { name: "Wynn", gender: null }, { name: "Ynyr", gender: null }, { name: "Ysberin", gender: null }, { name: "Aberfa", gender: null }, { name: "Addfwyn", gender: null }, { name: "Aderyn", gender: null }, { name: "Aelwen", gender: null }, { name: "Aelwyd", gender: null }, { name: "Aeres", gender: null }, { name: "Aerona", gender: null }, { name: "Aeronwen", gender: null }, { name: "Alaw", gender: null }, { name: "Alis", gender: null }, { name: "Alwen", gender: null }, { name: "Alwena", gender: null }, { name: "Alys", gender: null }, { name: "Amser", gender: null }, { name: "Aneira", gender: null }, { name: "Anest", gender: null }, { name: "Angharad", gender: null }, { name: "Anna", gender: null }, { name: "Annest", gender: null }, { name: "Anwen", gender: null }, { name: "Anwyn", gender: null }, { name: "Arglwyddes", gender: null }, { name: "Arian", gender: null }, { name: "Ariana", gender: null }, { name: "Arianrhod", gender: null }, { name: "Arianwen", gender: null }, { name: "Artaith", gender: null }, { name: "Arwen", gender: null }, { name: "Arwydd", gender: null }, { name: "Aures", gender: null }, { name: "Awen", gender: null }, { name: "Awsta", gender: null }, { name: "Beca", gender: null }, { name: "Begw", gender: null }, { name: "Berthog", gender: null }, { name: "Bethan", gender: null }, { name: "Beti", gender: null }, { name: "Betrys", gender: null }, { name: "Betsan", gender: null }, { name: "Blodeuwedd", gender: null }, { name: "Blodwen", gender: null }, { name: "Blodwyn", gender: null }, { name: "Braith", gender: null }, { name: "Brangwen", gender: null }, { name: "Brangwy", gender: null }, { name: "Branwen", gender: null }, { name: "Branwenn", gender: null }, { name: "Branwyn", gender: null }, { name: "Brenda", gender: null }, { name: "Briallen", gender: null }, { name: "Bronwen", gender: null }, { name: "Bronwyn", gender: null }, { name: "Buddug", gender: null }, { name: "Cadi", gender: null }, { name: "Cadwyn", gender: null }, { name: "Caitlyn", gender: null }, { name: "Callwen", gender: null }, { name: "Caniad", gender: null }, { name: "Cari", gender: null }, { name: "Caron", gender: null }, { name: "Carwen", gender: null }, { name: "Caryl", gender: null }, { name: "Carys", gender: null }, { name: "Catelyn", gender: null }, { name: "Cati", gender: null }, { name: "Catrin", gender: null }, { name: "Ceinwen", gender: null }, { name: "Ceirios", gender: null }, { name: "Ceri", gender: null }, { name: "Cerian", gender: null }, { name: "Ceridwen", gender: null }, { name: "Cerys", gender: null }, { name: "Clwyd", gender: null }, { name: "Cothi", gender: null }, { name: "Cranogwen", gender: null }, { name: "Creiddylad", gender: null }, { name: "Cristyn", gender: null }, { name: "Cymreiges", gender: null }, { name: "Daere", gender: null }, { name: "Dafina", gender: null }, { name: "Delwen", gender: null }, { name: "Delyth", gender: null }, { name: "Derwen", gender: null }, { name: "Deryn", gender: null }, { name: "Difyr", gender: null }, { name: "Dilys", gender: null }, { name: "Dona", gender: null }, { name: "Dwynwen", gender: null }, { name: "Dwysil", gender: null }, { name: "Ebrill", gender: null }, { name: "Efa", gender: null }, { name: "Eheubryd", gender: null }, { name: "Eiddwen", gender: null }, { name: "Eilian", gender: null }, { name: "Eiluned", gender: null }, { name: "Eilwen", gender: null }, { name: "Eira", gender: null }, { name: "Eirian", gender: null }, { name: "Eiriana", gender: null }, { name: "Eirianedd", gender: null }, { name: "Eiriol", gender: null }, { name: "Eirlys", gender: null }, { name: "Eirwen", gender: null }, { name: "Elain", gender: null }, { name: "Elan", gender: null }, { name: "Elen", gender: null }, { name: "Elena", gender: null }, { name: "Elenydd", gender: null }, { name: "Eleri", gender: null }, { name: "Elin", gender: null }, { name: "Elinor", gender: null }, { name: "Elliw", gender: null }, { name: "Eluned", gender: null }, { name: "Elwyn", gender: null }, { name: "Eneuawg", gender: null }, { name: "Enfys", gender: null }, { name: "Enrhydreg", gender: null }, { name: "Erdudvyl", gender: null }, { name: "Erin", gender: null }, { name: "Eryn", gender: null }, { name: "Esyllt", gender: null }, { name: "Eurneid", gender: null }, { name: "Eurolwyn", gender: null }, { name: "Eurwen", gender: null }, { name: "Fanw", gender: null }, { name: "Ffanci", gender: null }, { name: "Ffion", gender: null }, { name: "Fflur", gender: null }, { name: "Ffraid", gender: null }, { name: "Fioled", gender: null }, { name: "Gaenor", gender: null }, { name: "Garwen", gender: null }, { name: "Gaynor", gender: null }, { name: "Gladys", gender: null }, { name: "Glain", gender: null }, { name: "Glenda", gender: null }, { name: "Glenys", gender: null }, { name: "Glesni", gender: null }, { name: "Glyn", gender: null }, { name: "Glynis", gender: null }, { name: "Glynnis", gender: null }, { name: "Goewyn", gender: null }, { name: "Grug", gender: null }, { name: "Guinevere", gender: null }, { name: "Gwaeddan", gender: null }, { name: "Gwanwyn", gender: null }, { name: "Gwawr", gender: null }, { name: "Gwen", gender: null }, { name: "Gwenabwy", gender: null }, { name: "Gwenant", gender: null }, { name: "Gwendolen", gender: null }, { name: "Gwendoline", gender: null }, { name: "Gwendolyn", gender: null }, { name: "Gweneth", gender: null }, { name: "Gwenfrewy", gender: null }, { name: "Gwenifer", gender: null }, { name: "Gwenith", gender: null }, { name: "Gwenledyr", gender: null }, { name: "Gwenllian", gender: null }, { name: "Gwennalarch", gender: null }, { name: "Gwennan", gender: null }, { name: "Gwenyth", gender: null }, { name: "Gwladys", gender: null }, { name: "Gwlithen", gender: null }, { name: "Gwylan", gender: null }, { name: "Gwyn", gender: null }, { name: "Gwynedd", gender: null }, { name: "Gwynefa", gender: null }, { name: "Gwynes", gender: null }, { name: "Gwyneth", gender: null }, { name: "Gwynn", gender: null }, { name: "Haf", gender: null }, { name: "Hafren", gender: null }, { name: "Hafwen", gender: null }, { name: "Heledd", gender: null }, { name: "Heulwen", gender: null }, { name: "Ifanna", gender: null }, { name: "Ina", gender: null }, { name: "Iola", gender: null }, { name: "Iona", gender: null }, { name: "Iorwen", gender: null }, { name: "Irwen", gender: null }, { name: "Isolde", gender: null }, { name: "Jestine", gender: null }, { name: "Leri", gender: null }, { name: "Lili", gender: null }, { name: "Liliwen", gender: null }, { name: "Llian", gender: null }, { name: "Llinos", gender: null }, { name: "Llion", gender: null }, { name: "Lona", gender: null }, { name: "Lowri", gender: null }, { name: "Luned", gender: null }, { name: "Lyn", gender: null }, { name: "Lyneth", gender: null }, { name: "Lynn", gender: null }, { name: "Lynne", gender: null }, { name: "Mabli", gender: null }, { name: "Mabyn", gender: null }, { name: "Madlen", gender: null }, { name: "Maegan", gender: null }, { name: "Maeryn", gender: null }, { name: "Mai", gender: null }, { name: "Mair", gender: null }, { name: "Mairead", gender: null }, { name: "Mairwen", gender: null }, { name: "Mali", gender: null }, { name: "Mallt", gender: null }, { name: "Manod", gender: null }, { name: "Manon", gender: null }, { name: "Maredudd", gender: null }, { name: "Marged", gender: null }, { name: "Margred", gender: null }, { name: "Mari", gender: null }, { name: "Mati", gender: null }, { name: "Maygan", gender: null }, { name: "Medi", gender: null }, { name: "Megan", gender: null }, { name: "Meggan", gender: null }, { name: "Meinir", gender: null }, { name: "Meinwen", gender: null }, { name: "Meleri", gender: null }, { name: "Men", gender: null }, { name: "Meredydd", gender: null }, { name: "Mererid", gender: null }, { name: "Mona", gender: null }, { name: "Morgaine", gender: null }, { name: "Morgana", gender: null }, { name: "Morgann", gender: null }, { name: "Morvudd", gender: null }, { name: "Morwen", gender: null }, { name: "Morwenna", gender: null }, { name: "Morwyn", gender: null }, { name: "Myfanawy", gender: null }, { name: "Myfanwy", gender: null }, { name: "Myfi", gender: null }, { name: "Nerys", gender: null }, { name: "Nest", gender: null }, { name: "Nesta", gender: null }, { name: "Nia", gender: null }, { name: "Non", gender: null }, { name: "Olwen", gender: null }, { name: "Olwenna", gender: null }, { name: "Olwina", gender: null }, { name: "Olwyn", gender: null }, { name: "Olwyna", gender: null }, { name: "Owena", gender: null }, { name: "Penarddun", gender: null }, { name: "Prydwen", gender: null }, { name: "Rhedyn", gender: null }, { name: "Rhiain", gender: null }, { name: "Rhian", gender: null }, { name: "Rhiannon", gender: null }, { name: "Rhona", gender: null }, { name: "Rhonwen", gender: null }, { name: "Rhoslyn", gender: null }, { name: "Rhoswen", gender: null }, { name: "Saeth", gender: null }, { name: "Sara", gender: null }, { name: "Seirian", gender: null }, { name: "Seren", gender: null }, { name: "Sian", gender: null }, { name: "Siani", gender: null }, { name: "Siany", gender: null }, { name: "Sioned", gender: null }, { name: "Siriol", gender: null }, { name: "Siwan", gender: null }, { name: "Sulwyn", gender: null }, { name: "Tagwen", gender: null }, { name: "Tangwen", gender: null }, { name: "Tanwen", gender: null }, { name: "Tegan", gender: null }, { name: "Tegwen", gender: null }, { name: "Tegyd", gender: null }, { name: "Teleri", gender: null }, { name: "Telyn", gender: null }, { name: "Terrwyn", gender: null }, { name: "Tirion", gender: null }, { name: "Tonwen", gender: null }, { name: "Valmai", gender: null }, { name: "Winnie", gender: null }, { name: "Wyn", gender: null }, { name: "Wynne", gender: null }, { name: "Ysbail", gender: null }],
    titles: ['Warden', 'Gardener', 'Explorer', 'Crusader', 'Knight', 'Harvester', 'Scholar', 'Valiant', 'Tactician', 'Agent']
}
const human = {
    //human names are selected from a nationality, and then each name is constructed from a combo of that nationality's names

};
}());
