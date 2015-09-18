var app = angular.module("main", []);
app.controller("MainController", function($scope, $window) {
    $scope.names = ['None yet!'];
    $scope.races = ['Asura', 'Human', 'Charr', 'Sylvari', 'Norn'];
    $scope.nameForm = {
        num: 20
    };
    $scope.getNames = function(form) {
        $scope.names = [];
        var getOneName;
        if (form.name == 'Asura') {
            getOneName = $scope.getAsura;
        } else if (form.name == 'Human') {
            getOneName = $scope.getHuman;
        } else if (form.name == 'Charr') {
            getOneName = $scope.getCharr;
        } else if (form.name == 'Sylvari') {
            getOneName = $scope.getSylvari;
        } else if (form.name == 'Norn') {
            getOneName = $scope.getNorn;
        }
        for (var i = 0; i < form.num; i++) {
            var newName = getOneName();
            while ($scope.names.indexOf(newName) != -1) {
                newName = getOneName();
            }
            $scope.names.push(newName);
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
        //first, the title
        var name = asura.titles[Math.floor(Math.random() * asura.titles.length)] + ' ';
        //then, a consonant or consonant cluster
        name += firstCons[Math.floor(Math.random() * firstCons.length)];
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
        return name;
    };
    $scope.getHuman = function() {
        return Math.random();
    };
    $scope.getCharr = function() {
        var name = charr.praenomen[Math.floor(Math.random() * charr.praenomen.length)]
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
        return Math.random();
    };
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
        }else{
            //otherwise, patro/matronymic
            name += ' '+ norn.name[Math.floor(Math.random() * norn.name.length)]
            if (Math.random()>0.5){
                name += 'sdottir';
            } else {
                name+='sson';
            }
        }
        return name;
    };
});
