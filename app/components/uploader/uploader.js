'use strict'

angular
  .module('angularWistiaUpoloaderApp')
  .component('uploader', {
    templateUrl: './components/uploader/uploader.html',
    bindings: {
      id: "@",
      wistiapass: "@"
    },
    controller: function($scope, $timeout, $sce, $http) {
      var $ctrl = this;

      $ctrl.$onInit = function() {

      $ctrl.hashId   = '';
      $ctrl.progress = 0;
      $ctrl.status   = 'idle';
      $ctrl.url      = '';



        $ctrl.checkStatus = function() {
          $http({
            method: 'GET',
            url: 'https://api.wistia.com/v1/medias/' + $ctrl.hashId + '.json?api_password=' + $ctrl.wistiapass
          }).then(function (response) {
            $ctrl.status = response.data.status || '';

            if ($ctrl.status == 'ready')
              $ctrl.url = $sce.trustAsResourceUrl('http://fast.wistia.net/embed/iframe/' + $ctrl.hashId);
            else if ($ctrl.status != 'failed') {
              //check status again in a few seconds
              $timeout(function(){
                $ctrl.checkStatus();
              }, 3000);
            }
          });
        };

        $timeout(function(){
          $('#' + $ctrl.id + '_input').fileupload({
            dataType: 'json',
            formData: {
              api_password: $ctrl.wistiapass
            },
            add: function (e, data) {
              $ctrl.hashId   = '';
              $ctrl.progress = 0;
              $ctrl.status   = 'uploading';
              $ctrl.url      = '';

              data.submit();
            },
            done: function (e, data) {
              if (data.result.hashed_id != '') {
                $ctrl.hashId = data.result.hashed_id;
                $ctrl.checkStatus();
              }
            },
            progressall: function (e, data) {
              if (data.total > 0) {
                $scope.$apply(function(){
                  $ctrl.progress = parseInt(data.loaded / data.total * 100, 10);
                });
              }
            }
          });
        });
      }
    }
  })
