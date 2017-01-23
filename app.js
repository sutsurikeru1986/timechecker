'use strict';

var partialLocation = 'partials/',
    environmentUrl = '/';

// Declare app level module which depends on views, and components
angular.module('noTimeIrl', ['ngRoute'])

.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {

    $locationProvider.hashPrefix('!');

    $locationProvider.html5Mode(true).hashPrefix('!');

    $routeProvider
        .when(environmentUrl, {
            templateUrl: partialLocation + 'index.html',
            controller: 'timeKeeping'
        })
        .otherwise({
            redirectTo: environmentUrl
        });

}])

.filter('orderDays', function () {
    return function (input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for (var objectKey in input) {
            array.push(input[objectKey]);
        }
        //sort the array
        array.sort(function (a, b) {
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
})

.controller('timeKeeping', function ($http, $rootScope, $scope) {

    $scope.days = [
        {
            id: 1,
            day: "Monday",
            time: ""
        },
        {
            id: 2,
            day: "Tuesday",
            time: ""
        },
        {
            id: 3,
            day: "Wednesday",
            time: ""
        },
        {
            id: 4,
            day: "Thursday",
            time: ""
        },
        {
            id: 5,
            day: "Friday",
            time: ""
        },
    ];

    $scope.selectedOption = {
        id: "1",
        day: "Monday",
        time: "",
    }

    $scope.timeSheetStorage = localStorage.getItem('timeKeepingStorage');
    $scope.timeStamp = null;

    if ($scope.timeSheetStorage != null) {
        $scope.timeStamp = JSON.parse($scope.timeSheetStorage);
    };

    if ($scope.timeStamp === null || $scope.timeStamp.length == 0) {
        $rootScope.hideTimeStamp = true;
        //this means nothing has been submitted
        $scope.timeStamp = [];
    } else {
        $rootScope.hideTimeStamp = false;
        //otherwise get whats in storage
        $scope.timeStamp = JSON.parse($scope.timeSheetStorage);
    }

    $scope.updateDay = function (day) {

        console.log($scope.selectedOption);
        console.log(day);

        //Add 8 hrs to end time - make an exception for friday - todo
        $scope.endTime = new Date($scope.selectedOption.time);

        if($scope.selectedOption.day === "Friday") {
            $scope.endTime.setHours($scope.endTime.getHours() + 7);
        } else {
            $scope.endTime.setHours($scope.endTime.getHours() + 8);
        }

        //add new key to object for endTime
        $scope.selectedOption.home = $scope.endTime;

        if ($scope.selectedOption.time != '') {

            //Define the local storage object
            $scope.timeStorage = localStorage.getItem('timeKeepingStorage');

            if ($scope.timeStorage != null) {

                //Create JSON object from local storage string
                $scope.timeStorageJson = JSON.parse($scope.timeStorage);

                //Assume time hasn't already been submitted
                var timeSubmited = false;

                //Loop through time and try to match to selected day
                for (var i = $scope.timeStorageJson.length - 1; i >= 0; i--) {

                    console.log($scope.timeStorageJson[i].day);

                    //if you try and submit a time for a day that is already in localstorage, remove the old time and replace it with the new time - must be a better way of doing this
                    if ($scope.timeStorageJson[i].day == $scope.selectedOption.day) {

                        timeSubmited = true;

                        //Now delete the item from the JSON object within the temp object timeStamp and in localstorage
                        $scope.timeStorageJson.splice(i, 1);
                        $scope.timeStamp.splice(i, 1);

                        //push updated time
                        $scope.timeStorageJson.push($scope.selectedOption);
                        $scope.timeStamp.push($scope.selectedOption);

                        //Save it back to local Storage
                        localStorage.setItem("timeKeepingStorage", JSON.stringify($scope.timeStorageJson));
                        $rootScope.hideTimeStamp = false;

                        break;

                    }

                };

                //ottherwise if the day doesnt exist in localstorage - submit it
                if (!timeSubmited) {
                    $scope.timeStorageJson.push($scope.selectedOption);
                    $scope.timeStamp = $scope.timeStorageJson;
                    localStorage.setItem("timeKeepingStorage", JSON.stringify($scope.timeStorageJson));
                    $rootScope.hideTimeStamp = false;
                }

            } else {

                //if it is null, set up an array and push the first day into it
                $scope.timeStorageJson = [];
                $scope.timeStamp.push($scope.selectedOption);

                $scope.timeStorageJson.push($scope.selectedOption);
                localStorage.setItem("timeKeepingStorage",
                    JSON.stringify($scope.timeStorageJson));
                $rootScope.hideTimeStamp = false;

            }

        } else {

            //they havent added a time, so don't do anything other then display a message letting them know
            $scope.popup = new Foundation.Reveal(angular.element(document.querySelector('#noTimeForThat')));
            $scope.popup.open();

        }

    }

    $scope.removeTimeStamp = function (day) {

        //Check for timestamp
        for (var i = $scope.timeStamp.length - 1; i >= 0; i--) {
            if ($scope.timeStamp[i].day == day) {

                $scope.timeStamp.splice(i, 1);

                //update localstroage after the deletion
                localStorage.setItem("timeKeepingStorage", JSON.stringify($scope.timeStamp));
            }
        }
        if ($scope.timeStamp.length == 0) {
            $rootScope.hideTimeStamp = true;
        }

    }

    $scope.clearWeek = function () {
        //clear all the localStorage
        localStorage.clear();
        //clear timeStamp object
        $scope.timeStamp = [];
        $rootScope.hideTimeStamp = true;
    }

});
