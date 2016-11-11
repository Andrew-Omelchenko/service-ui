/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var StepLogDefectTypeView = require('launches/common/StepLogDefectTypeView');
    var ModalLaunchItemEdit = require('modals/modalLaunchItemEdit');

    var config = App.getInstance();


    var StepItemView = Epoxy.View.extend({
        template: 'tpl-launch-step-item',
        events: {
            'click [data-js-name-link]': 'onClickName',
            'click [data-js-time-format]': 'toggleStartTimeView',
            'click [data-js-item-edit]': 'onClickEdit',
        },
        bindings: {
            '[data-js-name-link]': 'attr: {href: url}',
            '[data-js-name]': 'text: name',
            '[data-js-description]': 'text: description',
            '[data-js-status]': 'text: status',
            '[data-js-owner-block]': 'classes: {hide: not(owner)}',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-tags-container]': 'sortTags: tags',
            '[data-js-method-type]': 'text: showMethodType',
            '[data-js-time-from-now]': 'text: startFromNow',
            '[data-js-time-exact]': 'text: startFormat',
            '[data-js-status-class]': 'classes: {danger: highlightedFailed, "select-state": select}',
            '[data-js-select-item]': 'checked:select',
        },
        bindingHandlers: {
            sortTags: {
                set: function($element) {
                    var sortTags = this.view.model.get('sortTags');
                    if(!sortTags.length){
                        $element.addClass('hide');
                    } else {
                        $element.removeClass('hide');
                    }
                    var $tagsBlock = $('[data-js-tags]', $element);
                    $tagsBlock.html('');
                    _.each(sortTags, function(tag) {
                        $tagsBlock.append('  <a data-js-tag="' + tag + '">' + tag.replaceTabs() + '</a>')
                    })
                }
            }
        },
        computeds: {
            showMethodType: function(){
                return Localization.testTableMethodTypes[this.getBinding('type')];
            },
            highlightedFailed: function(){
                return this.getBinding('status') == 'FAILED';
            }
        },
        initialize: function(options) {
            this.noIssue = options.noIssue;
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true}),
                noIssue: this.noIssue,
                isCollapsedMethod: this.isCollapsedMethod()
            }));
            this.renderDuration();
            if(this.hasIssue() && !this.noIssue){
                this.renderIssue();
            }
        },
        renderDuration: function(){
            this.duration && this.duration.destroy();
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-item-status]', this.$el)
            });
        },
        toggleStartTimeView: function (e) {
            this.model.collection.trigger('change:time:format')
        },
        isCollapsedMethod: function () {
            return this.model.get('type') !== 'STEP' &&  this.model.get('status') !== 'FAILED';
        },
        hasIssue: function(){
            var issue = this.model.get('issue');
            return issue ? true : false;
        },
        renderIssue: function(){
            this.issueView = new StepLogDefectTypeView({
                model: this.model,
                el: $('[data-js-step-issue]', this.$el)
            });
        },
        onClickName: function(e) {
            e.preventDefault();
            var href = $(e.currentTarget).attr('href');
            if(href != '') {
                this.model.trigger('drill:item', this.model);
                config.router.navigate(href, {trigger: true});
            } else {
                var currentPath = window.location.hash;
                currentPath += '&log.item=' + this.model.get('id');
                config.router.navigate(currentPath, {trigger: true});
            }

        },
        onClickEdit: function() {
            var modal = new ModalLaunchItemEdit({
                item: this.model,
            })
            modal.show();
        },
        destroy: function () {
            this.issueView && this.issueView.destroy();
            this.duration && this.duration.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });

    return StepItemView;
});
