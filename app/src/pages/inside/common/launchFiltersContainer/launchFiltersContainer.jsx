import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { connect } from 'react-redux';
import {
  launchFiltersSelector,
  changeActiveFilterAction,
  updateFilterConditionsAction,
  activeFilterSelector,
  removeLaunchesFilterAction,
  createFilterAction,
  addFilteringFieldToConditions,
} from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { fetchLaunchesWithParamsAction, fetchLaunchesAction } from 'controllers/launch';
import { debounce } from 'common/utils';
import { hideFilterOnLaunchesAction } from 'controllers/project';
import { isEmptyValue } from 'common/utils/isEmptyValue';
import { PAGE_KEY } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/sorting';
import { createFilterQuery } from 'components/filterEntities/containers/utils';

@connect(
  (state) => ({
    launchFilters: launchFiltersSelector(state),
    activeFilterId: filterIdSelector(state),
    activeFilter: activeFilterSelector(state),
  }),
  {
    changeActiveFilterAction,
    fetchLaunchesWithParamsAction,
    updateFilterConditionsAction,
    fetchLaunchesAction,
    hideFilterOnLaunchesAction,
    removeLaunchesFilterAction,
    createFilter: createFilterAction,
  },
)
export class LaunchFiltersContainer extends Component {
  static propTypes = {
    launchFilters: PropTypes.array,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeFilter: PropTypes.object,
    render: PropTypes.func.isRequired,
    changeActiveFilterAction: PropTypes.func,
    fetchLaunchesWithParamsAction: PropTypes.func,
    updateFilterConditionsAction: PropTypes.func,
    fetchLaunchesAction: PropTypes.func,
    hideFilterOnLaunchesAction: PropTypes.func,
    removeLaunchesFilterAction: PropTypes.func,
    createFilter: PropTypes.func,
    onChange: PropTypes.func,
    sortingString: PropTypes.string,
  };

  static defaultProps = {
    launchFilters: [],
    activeFilter: null,
    activeFilterId: null,
    changeActiveFilterAction: () => {},
    fetchLaunchesWithParamsAction: () => {},
    updateFilterConditionsAction: () => {},
    fetchLaunchesAction: () => {},
    hideFilterOnLaunchesAction: () => {},
    removeLaunchesFilterAction: () => {},
    createFilter: () => {},
    onChange: () => {},
    sortingString: '',
  };

  getConditions = () => {
    const { activeFilter } = this.props;
    if (!activeFilter) {
      return {};
    }
    return activeFilter.conditions.reduce(
      (acc, condition) => ({ ...acc, [condition.filteringField]: condition }),
      {},
    );
  };

  fetchLaunches = debounce((query) => this.props.fetchLaunchesWithParamsAction(query), 1000);

  createQuery = (conditions) =>
    createFilterQuery(
      Object.keys(conditions)
        .filter((id) => !isEmptyValue(conditions[id].value))
        .reduce((res, key) => {
          const condition = conditions[key];
          return {
            ...res,
            [condition.filteringField]: condition,
          };
        }, {}),
    );

  handleFilterChange = (conditions) => {
    const conditionsWithFilteringField = addFilteringFieldToConditions(conditions);
    const newFilter = this.createQuery(conditionsWithFilteringField);
    const currentFilter = this.createQuery(this.getConditions());
    if (!isEqual(currentFilter, newFilter)) {
      this.fetchLaunches({ [PAGE_KEY]: 1, ...newFilter });
    }
    if (this.props.activeFilter) {
      this.updateFilter(this.props.activeFilterId, conditionsWithFilteringField);
    } else {
      this.props.createFilter({
        conditions: conditionsWithFilteringField,
      });
    }

    this.props.onChange(conditions);
  };

  handleFilterRemove = (filter) => {
    if (filter.id >= 0) {
      this.props.hideFilterOnLaunchesAction(filter);
    }
    this.props.removeLaunchesFilterAction(filter.id);
  };

  handleFilterSelect = (filterId) => {
    this.props.changeActiveFilterAction(filterId);
  };

  updateFilter = (filterId, conditions) => {
    this.props.updateFilterConditionsAction(filterId, conditions);
  };

  updateFilterOrder = (filterId, sortingString) => {
    const currentFilter = this.createQuery(this.getConditions());

    this.fetchLaunches({ [PAGE_KEY]: 1, [SORTING_KEY]: sortingString, ...currentFilter });
  };

  render() {
    const { render, launchFilters, activeFilterId, activeFilter } = this.props;
    return render({
      launchFilters,
      activeFilterId,
      activeFilter,
      onSelectFilter: this.handleFilterSelect,
      onRemoveFilter: this.handleFilterRemove,
      onChangeFilter: this.handleFilterChange,
      activeFilterConditions: this.getConditions(),
      onResetFilter: this.props.fetchLaunchesAction,
      onUpdateFilterOrder: this.updateFilterOrder,
    });
  }
}
