import { GenericDatasource } from './datasource';
import { TezosQueryCtrl } from './query_ctrl';

class TezosAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

class TezosConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  /** @ngInject */
  constructor($scope) {
    this.current.jsonData = this.current.jsonData || {};
  }
}

export {
  GenericDatasource as Datasource,
  TezosQueryCtrl as QueryCtrl,
  TezosConfigCtrl as ConfigCtrl,
  TezosAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
