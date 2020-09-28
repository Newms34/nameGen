String.prototype.capCase = function () {
    return this.slice(0, 1).toUpperCase() + this.slice(1).toLowerCase();
}

const ra = a => {
    return a[Math.floor(Math.random() * a.length)]
},
    v = new Vue({
        data: {
            working: false,
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
                fn: 'fetchHuman'
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
        },
        methods: {
            getNames() {
                if (this.selectedRace == -1) {
                    return false;
                }
                this[this.races[this.selectedRace].fn]();
            },
            getSylvari() {
                this.nameList = [];
                console.log(sylvari.names.length)
                for (let i = 0; i < this.numNames; i++) {
                    let name = ra(sylvari.names);
                    this.nameList.push({
                        name: name.name,
                        title: Math.random() > 0.3 ? ra(sylvari.titles) : null,
                        notes: {
                            gender: name.gender
                        }
                    })
                }
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
            fetchHuman() {
                this.nameList = [];
                // for (let i=0;i<this.numNames;i++){
                //     this.nameList.push(`${ra(sylvari.titles)} ${ra(sylvari.names)}`)
                // }
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
        created() { }
    }).$mount('#main')