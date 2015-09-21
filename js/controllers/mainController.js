var app = angular.module("main", []);
app.controller("MainController", function($scope, $window, $compile, $q) {
    $scope.names = ['None yet!'];
    $scope.races = ['Asura', 'Human', 'Charr', 'Sylvari', 'Norn'];
    $scope.ranOnce = false;
    $scope.nameForm = {
        name: 'Human',
        num: 20
    };
    $scope.getNames = function() {
        $scope.ranOnce = true;
        $scope.names = [];
        var getOneName;
        if ($scope.nameForm.name == 'Asura') {
            getOneName = $scope.getAsura;
        } else if ($scope.nameForm.name == 'Human') {
            getOneName = $scope.getHuman;
        } else if ($scope.nameForm.name == 'Charr') {
            getOneName = $scope.getCharr;
        } else if ($scope.nameForm.name == 'Sylvari') {
            getOneName = $scope.getSylvari;
        } else if ($scope.nameForm.name == 'Norn') {
            getOneName = $scope.getNorn;
        }
        for (var i = 0; i < $scope.nameForm.num; i++) {
            var newName = getOneName();
            var title = newName.split(' ')[0]
            var name = newName.split(' ')[1];
            var nameHTML = '<a href="https://en.wiktionary.org/wiki/' + name + '" target = "_blank">' + newName + '</a>';
            console.log(nameHTML)
            while ($scope.names.indexOf(newName) != -1 && $scope.names.indexOf(nameHTML) != -1) {
                newName = getOneName();
            }
            $scope.names.push(newName);
        }
        if ($scope.nameForm.name === 'Asura') {
            //Asura, so check wiktionary
            var asuraLinkProms = [];
            $scope.names.forEach(function(el) {
                var name = el.split(' ')[1].toLowerCase();
                asuraLinkProms.push($.ajax({
                    url: 'https://en.wiktionary.org/w/api.php?action=query&format=json&titles=' + name,
                    dataType:'jsonp'
                }));
            });
            $q.all(asuraLinkProms).then(function(asuraLinkRes) {
                //now, search for each element in the original $scope.names array, and replace as needed.
                for (var i = 0; i < asuraLinkRes.length; i++) {
                    var theNameData = asuraLinkRes[i].query.pages[Object.keys(asuraLinkRes[i].query.pages)[0]];
                    if (theNameData.pageid) {
                            //convert to Title Case.
                        theNameData.title = theNameData.title.replace(/\w\S*/g, function(txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        });
                        for (var n = 0; n < $scope.names.length; n++) {
                            var nameToCompare = $scope.names[n].split(' '); //we're just interested in the name, not the title.
                            if (nameToCompare[nameToCompare.length - 1] == theNameData.title) {
                                //Found it!
                                var title = nameToCompare.length > 1 ? nameToCompare[0] + ' ' : '';
                                try {
                                    $scope.names[n] = '<a href="https://en.wiktionary.org/wiki/' + nameToCompare[nameToCompare.length - 1].toLowerCase() + '" target = "_blank">' + title + nameToCompare[nameToCompare.length - 1] + '</a>';
                                } catch (e) {
                                    console.log(nameToCompare, e, nameToCompare.length);
                                }
                            }
                        }
                    }
                }

            });
        }
    }
    $scope.getAsura = function() {
        var firstCons = [];
        asura.cons.forEach(function(el) {
            firstCons.push(el.toUpperCase());
        });
        asura.clusts.forEach(function(el) {
            firstCons.push(el);
        });
        //first, a consonant or consonant cluster
        var name = firstCons[Math.floor(Math.random() * firstCons.length)];
        //next, a vowel.
        name += asura.vows[Math.floor(Math.random() * asura.vows.length)];
        //another consonant;
        var midCons = asura.cons[Math.floor(Math.random() * asura.cons.length)];
        if (Math.random() > .5) {
            midCons += midCons;
        }
        name += midCons;
        //and finally, optional end vowel
        if (Math.random() > .5) {
            name += asura.vows[Math.floor(Math.random() * asura.vows.length)];
        }
        name = asura.titles[Math.floor(Math.random() * asura.titles.length)] + ' ' + name;
        return name;

    };
    $scope.getHuman = function() {
        //for now, just return a number so we dont crash!
        return Math.random().toString();
    };
    $scope.getCharr = function() {
        var name = charr.praenomen[Math.floor(Math.random() * charr.praenomen.length)];
        name += ' ' + charr.nouns[Math.floor(Math.random() * charr.nouns.length)]
        if (Math.random() > .5) {
            //use another noun
            name += charr.nouns[Math.floor(Math.random() * charr.nouns.length)].toLowerCase();
        } else {
            //use an agent
            name += charr.agents[Math.floor(Math.random() * charr.agents.length)]
        }
        return name;
    };
    $scope.getSylvari = function() {
        var name = sylvari.name[Math.floor(Math.random() * sylvari.name.length)];
        //now determine if the veggie has a title.
        if (Math.random() > 0.5) {
            var whichTi = sylvari.titles[Math.floor(Math.random() * sylvari.titles.length)];
            name = whichTi + ' ' + name;
        }
        return name;
    }
    $scope.getNorn = function() {
        var name = norn.name[Math.floor(Math.random() * norn.name.length)]

        if (Math.random() > 0.5) {
            name += ' ' + charr.nouns[Math.floor(Math.random() * charr.nouns.length)]
                //50% chance of using the charr last name generator
            if (Math.random() > 0.5) {
                //use another noun
                name += charr.nouns[Math.floor(Math.random() * charr.nouns.length)].toLowerCase();
            } else {
                //use an agent
                name += charr.agents[Math.floor(Math.random() * charr.agents.length)]
            }
        } else {
            //otherwise, patro/matronymic
            name += ' ' + norn.name[Math.floor(Math.random() * norn.name.length)]
                //first, check to see if it ends in 's'. If not, append one.
            if (name[name.length - 1] != 's') {
                name += 's';
            }
            //now add dottir or son
            if (Math.random() > 0.5) {
                name += 'dottir';
            } else {
                name += 'son';
            }
        }
        return name;
    };
});
app.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});
