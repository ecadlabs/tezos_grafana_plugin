import { QueryCtrl } from 'grafana/app/plugins/sdk';
import { queries } from './queries/account';
import { blockQueries } from './queries/block';

export class TezosQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';

  accountSubQueryTypes = queries.map(({ display_name, query_type }) => ({
    value: query_type,
    text: display_name
  }));

  blockSubQueryTypes = blockQueries.map(({ display_name, query_type }) => ({
    value: query_type,
    text: display_name
  }));

  queryTypes = [
    { value: 'block', text: 'Block', defaults: blockQueries },
    { value: 'account', text: 'Account', defaults: queries }
  ];

  /** @ngInject **/
  constructor($scope, $injector) {
    super($scope, $injector);
    this.onSave();
  }

  onSave() {
    if (!this.target.queryType) {
      this.target.queryType = 'block';
    }

    if (!this.target.subQueryType) {
      this.target.subQueryType = this.queryTypes.find(
        x => x.value === this.target.queryType
      )!.defaults[0].query_type;
    }
    this.panelCtrl.refresh();
  }

  get subQueryTypes() {
    switch (this.target.queryType) {
      case 'account':
        return this.accountSubQueryTypes;
      default:
        return this.blockSubQueryTypes;
    }
  }

  get showAccount() {
    return this.target && this.target.queryType === 'account';
  }
}
