///
/// Copyright 2015-2016 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///    http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

/// <reference path="../metricsPlugin.ts"/>
/// <reference path="../../includes.ts"/>

module HawkularMetrics {

  export enum AlertType {
    AVAILABILITY,
    THRESHOLD,
    RANGE
  }

  export interface IHawkularAlertCriteria {
    startTime?: TimestampInMillis;
    endTime?: TimestampInMillis;
    alertIds?: string;
    triggerIds?: string;
    statuses?: string;
    severities?: string;
    tags?: string;
    thin?: boolean;
    currentPage?: number;
    perPage?: number;
    sort?: string;
    order?: string;
  }

  export interface IHawkularActionCriteria {
    startTime?: TimestampInMillis;
    endTime?: TimestampInMillis;
    actionPlugins?: string;
    actionIds?: string;
    alertIds?: string;
    results?: string;
    thin?: boolean;
    currentPage?: number;
    perPage?: number;
    sort?: string;
    order?: string;
  }

  export interface IHawkularTriggerCriteria {
    triggerIds?: string;
    tags?: string;
    thin?: boolean;
    currentPage?: number;
    perPage?: number;
    sort?: string;
    order?: string;
  }

  export interface IHawkularAlertQueryResult {
    alertList: IAlert[];
    headers: any;
  }

  export interface IHawkularTriggerQueryResult {
    triggerList: IAlertTrigger[];
    headers: any;
  }

  export interface IHawkularAlertsManager {

    // Alerts

    /**
     * @name addEmailAction
     * @desc Check if a previous email action exists, or it creates a new one
     * @param email - recipient of the email action
     */
    addEmailAction(email:EmailType): ng.IPromise<void>;

    /**
     * @name queryAlerts
     * @desc Fetch Alerts with different criterias
     * @param criteria - Filter for alerts query
     * @returns {ng.IPromise} with a list of Alerts
     */
    queryAlerts(criteria?:IHawkularAlertCriteria):
      ng.IPromise<IHawkularAlertQueryResult>;

    /**
     * @name getAlert
     * @desc Single alert fetch
     * @param alertId - Alert to query
     */
    getAlert(alertId:string): ng.IPromise<IAlert>;

    /**
     * @name queryActionsHistory
     * @desc Fetch Actions from history with different criterias
     * @param criteria - Filter for actions query
     */
    queryActionsHistory(criteria?:IHawkularActionCriteria): ng.IPromise<any>;

    /**
     * @name resolveAlerts
     * @desc Mark as resolved a list of alerts*
     * @param resolvedAlerts - An object with the description of the resolution of the alerts, in the form
     *
     *    resolvedAlerts = {
     *      alertIds: A string with a comma separated list of Alert ids,
     *      resolvedBy: The user responsible for the resolution of the alerts,
     *      resolvedNotes: Additional notes to add in the resolved state
     *    }
     *
     * @returns {ng.IPromise}
     */
    resolveAlerts(resolvedAlerts:any): ng.IPromise<any>;

    /**
     * @name addNote
     * @desc Add a note on an alert
     * @param alertNote - An object with the user and the text of the note in the form
     *
     *  alertNote = {
     *    alertId: A string with the alertId to place the note,
     *    user: The user author of the note,
     *    text: the content of the note
     *  }
     */
    addNote(alertNote:any): ng.IPromise<any>;

    /**
     * @name ackAlerts
     * @param ackAlerts
     * @param ackAlerts - An object with the description of the acknowledge of the alerts, in the form
     *
     *    ackAlerts = {
     *      alertIds: A string with a comma separated list of Alert ids,
     *      ackBy: The user responsible for the acknowledgement of the alerts,
     *      ackNotes: Additional notes to add in the acknowledged state
     *    }
     *
     * @returns {ng.IPromise}
     */
    ackAlerts(ackAlerts:any): ng.IPromise<any>;

    // Triggers

    /**
     * @name existTrigger
     * @desc Check if a trigger exists
     * @param {TriggerId} triggerId - The id of the trigger to check
     * @returns {ng.IPromise}
     */
    existTrigger(triggerId:TriggerId): any;

    /**
     * @name getTrigger
     * @desc Fetch a full Trigger with Dampening and Conditions object attached
     * @param {TriggerId} triggerId - The id of the trigger to fetch
     * @returns {ng.IPromise} with value:
     *
     *    promiseValue = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     */
    getTrigger(triggerId:TriggerId): any;

    /**
     * @name queryTriggers
     * @desc Fetch Triggers with different criterias
     * @param criteria - Filter for triggers query
     * @returns {ng.IPromise} with a list of Triggers
     */
    queryTriggers(criteria?:IHawkularTriggerCriteria):
      ng.IPromise<IHawkularTriggerQueryResult>;

    /**
     * @name getTriggerConditions
     * @desc Fetch only Conditions for a specified trigger
     * @param {TriggerId} triggerId - The id of the trigger to fetch Conditions
     * @returns {ng.IPromise} with a list of conditions as a value
     */
    getTriggerConditions(triggerId:TriggerId): ng.IPromise<any>;

    /**
     * @name createTrigger
     * @desc Create a Trigger with Dampenings and Conditions
     * @param fullTrigger - A full trigger representation where
     *
     *    fullTrigger = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     *
     * @param errorCallback - Function to be called on error
     */
    createTrigger(fullTrigger:any, errorCallback:any): ng.IPromise<void>;

    /**
     * @name deleteTrigger
     * @desc Delete a Trigger with associated Dampenings and Conditions
     * @param {TriggerId} triggerId - The id of the trigger to delete
     */
    deleteTrigger(triggerId:TriggerId): ng.IPromise<any>;

    /**
     * @name updateTrigger
     * @desc Update an existing Trigger with Dampenings and Conditions
     * @param fullTrigger - An existing full trigger representation where
     *
     *    fullTrigger = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     *
     * @param errorCallback - Function to be called on error
     * @param backup - A backup of the fullTrigger, it updates only the trigger, dampenings or conditions
     * that have been changed
     *
     *    backupTrigger = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     */
    updateTrigger(fullTrigger:any, errorCallback:any, backupTrigger?:any): ng.IPromise<any>;
  }

  export class HawkularAlertsManager implements IHawkularAlertsManager {
    constructor(private HawkularAlert:any,
                private $q:ng.IQService,
                private $log:ng.ILogService,
                private $moment:any,
                private ErrorsManager:IErrorsManager) {
    }

    public queryAlerts(criteria:IHawkularAlertCriteria):ng.IPromise<IHawkularAlertQueryResult> {
      let alertList = [];
      let headers;

      /* Format of Alerts:

       alert: {
       type: 'THRESHOLD' or 'AVAILABILITY',
       avg: Average value based on the evalSets 'values',
       start: The time of the first data ('dataTimestamp') in evalSets,
       threshold: The threshold taken from condition.threshold,
       end: The time when the alert was sent ('ctime')
       }

       */

      let queryParams = {};

      if (criteria && criteria.startTime) {
        queryParams['startTime'] = criteria.startTime;
      }

      if (criteria && criteria.endTime) {
        queryParams['endTime'] = criteria.endTime;
      }

      if (criteria && criteria.alertIds) {
        queryParams['alertIds'] = criteria.alertIds;
      }

      if (criteria && criteria.triggerIds) {
        queryParams['triggerIds'] = criteria.triggerIds;
      }

      if (criteria && criteria.statuses) {
        queryParams['statuses'] = criteria.statuses;
      }

      if (criteria && criteria.severities) {
        queryParams['severities'] = criteria.severities;
      }

      if (criteria && criteria.tags) {
        queryParams['tags'] = criteria.tags;
      }

      if (criteria && criteria.thin) {
        queryParams['thin'] = criteria.thin;
      }

      if (criteria && criteria.currentPage && criteria.currentPage !== 0) {
        queryParams['page'] = criteria.currentPage;
      }

      if (criteria && criteria.perPage) {
        queryParams['per_page'] = criteria.perPage;
      }

      if (criteria && criteria.sort) {
        queryParams['sort'] = criteria.sort;
      }

      if (criteria && criteria.order) {
        queryParams['order'] = criteria.order;
      }

      return this.HawkularAlert.Alert.query(queryParams, (serverAlerts:any, getHeaders:any) => {

        headers = getHeaders();
        let momentNow = this.$moment();

        for (let i = 0; i < serverAlerts.length; i++) {
          let serverAlert = serverAlerts[i];
          let consoleAlert:any = serverAlert;

          consoleAlert.id = serverAlert.id;

          consoleAlert.triggerId = serverAlert.triggerId;

          if (serverAlert.evalSets && serverAlert.evalSets[0] && serverAlert.evalSets[0][0]) {
            consoleAlert.dataId = serverAlert.evalSets[0][0].condition.dataId;
          }

          consoleAlert.end = serverAlert.ctime;

          let sum:number = 0.0;
          let count:number = 0.0;

          if (serverAlert.evalSets) {

            if (serverAlert.context.triggerType !== 'Event') {

              for (let j = 0; j < serverAlert.evalSets.length; j++) {
                let evalItem = serverAlert.evalSets[j][0];

                if (!consoleAlert.start && evalItem.dataTimestamp) {
                  consoleAlert.start = evalItem.dataTimestamp;
                }

                if (!consoleAlert.threshold && evalItem.condition.threshold) {
                  consoleAlert.threshold = evalItem.condition.threshold;
                }

                if (!consoleAlert.type && evalItem.condition.type) {
                  consoleAlert.type = evalItem.condition.type;
                }

                let momentAlert = this.$moment(consoleAlert.end);

                if (momentAlert.year() === momentNow.year()) {
                  consoleAlert.isThisYear = true;
                  if (momentAlert.dayOfYear() === momentNow.dayOfYear()) {
                    consoleAlert.isToday = true;
                  }
                }

                if ( undefined !== evalItem.rate ) {
                  // handle rate conditions
                  sum += evalItem.rate;
                } else {
                  // handle 'value' conditions and also compare conditions ('value1')
                  sum += ( ( undefined !== evalItem.value ) ? evalItem.value : evalItem.value1 );
                }
                count++;
              }

              consoleAlert.avg = sum / count;
              consoleAlert.durationTime = consoleAlert.end - consoleAlert.start;

            } else {
              let evalItem = serverAlert.evalSets[0][0];
              let event = evalItem.value;
              consoleAlert.message = event.context.Message;
            }
          }

          alertList.push(consoleAlert);
        }
      }, (error) => {
        this.$log.debug('querying data error', error);
      }).$promise.then(():IHawkularAlertQueryResult => {
          return {
            alertList: alertList,
            headers: headers
          };
        });
    }

    public getAlert(alertId:string):ng.IPromise<IAlert> {
      return this.HawkularAlert.Alert.get({alertId: alertId}).$promise;
    }

    public queryActionsHistory(criteria?:IHawkularActionCriteria):ng.IPromise<any> {
      let actionHistoryList = [];
      let headers;
      let queryParams = {};

      if (criteria && criteria.alertIds) {
        queryParams['alertIds'] = criteria.alertIds;
      }

      if (criteria && criteria.actionPlugins) {
        queryParams['actionPlugins'] = criteria.actionPlugins;
      }

      if (criteria && criteria.actionIds) {
        queryParams['actionIds'] = criteria.actionIds;
      }

      if (criteria && criteria.results) {
        queryParams['results'] = criteria.results;
      }

      if (criteria) {
        queryParams['thin'] = criteria.thin;
      } else {
        queryParams['thin'] = true;
      }

      if (criteria && criteria.startTime) {
        queryParams['startTime'] = criteria.startTime;
      }

      if (criteria && criteria.endTime) {
        queryParams['endTime'] = criteria.endTime;
      }

      if (criteria && criteria.currentPage && criteria.currentPage !== 0) {
        queryParams['page'] = criteria.currentPage;
      }

      if (criteria && criteria.perPage) {
        queryParams['per_page'] = criteria.perPage;
      }

      if (criteria && criteria.sort) {
        queryParams['sort'] = criteria.sort;
      }

      if (criteria && criteria.order) {
        queryParams['order'] = criteria.order;
      }

      return this.HawkularAlert.Action.queryHistory(queryParams, (serverActionsHistory:any, getHeaders:any) => {
        headers = getHeaders();
        actionHistoryList = serverActionsHistory;
      }, (error) => {
        this.$log.debug('querying data error', error);
      }).$promise.then(() => {
          return {
            actionsList: actionHistoryList,
            headers: headers
          };
        });
    }

    public resolveAlerts(resolvedAlerts:any):ng.IPromise<any> {
      return this.HawkularAlert.Alert.resolvemany(resolvedAlerts, {}).$promise;
    }

    public addNote(alertNote:any):ng.IPromise<any> {
      return this.HawkularAlert.Alert.note(alertNote).$promise;
    }

    public ackAlerts(ackAlerts:any):ng.IPromise<any> {
      return this.HawkularAlert.Alert.ackmany(ackAlerts, {}).$promise;
    }

    public existTrigger(triggerId:TriggerId):any {
      return this.HawkularAlert.Trigger.get({triggerId: triggerId}).$promise;
    }

    public getTrigger(triggerId:TriggerId):any {
      let deferred = this.$q.defer();
      let trigger = {};

      this.HawkularAlert.Trigger.get({triggerId: triggerId}).$promise.then((triggerData) => {
        trigger['trigger'] = triggerData;
        return this.HawkularAlert.Dampening.query({triggerId: triggerId}).$promise;
      }).then((dampeningData) => {
        trigger['dampenings'] = dampeningData;
        return this.HawkularAlert.Conditions.query({triggerId: triggerId}).$promise;
      }).then((conditionData)=> {
        trigger['conditions'] = conditionData;
        deferred.resolve(trigger);
      });

      return deferred.promise;
    }

    public getTriggerConditions(triggerId:TriggerId):ng.IPromise<any> {
      return this.HawkularAlert.Conditions.query({triggerId: triggerId}).$promise;
    }

    public createTrigger(fullTrigger:any, errorCallback:any):ng.IPromise<void> {

      let triggerDefaults = {
        description: 'Created on ' + Date(),
        firingMatch: 'ALL',
        autoResolveMatch: 'ALL',
        enabled: true,
        autoResolve: true,
        actions: {}
      };

      let trigger = angular.extend(triggerDefaults, fullTrigger.trigger);

      return this.HawkularAlert.Trigger.save(trigger).$promise.then((savedTrigger) => {

        let dampeningPromises = [];
        for (let i = 0; fullTrigger.dampenings && i < fullTrigger.dampenings.length; i++) {
          if (fullTrigger.dampenings[i]) {
            let dampeningPromise = this.HawkularAlert.Dampening.save({triggerId: savedTrigger.id},
              fullTrigger.dampenings[i]).$promise.then(null, (error) => {
                return this.ErrorsManager.errorHandler(error, 'Error creating dampening.', errorCallback);
              });
            dampeningPromises.push(dampeningPromise);
          }
        }

        let firingConditions = [];
        let autoResolveConditions = [];
        for (let j = 0; fullTrigger.conditions && j < fullTrigger.conditions.length; j++) {
          if (fullTrigger.conditions[j]) {
            if (fullTrigger.conditions[j].triggerMode && fullTrigger.conditions[j].triggerMode === 'AUTORESOLVE') {
              autoResolveConditions.push(fullTrigger.conditions[j]);
            } else {
              // A condition without triggerMode is treated as FIRING
              firingConditions.push(fullTrigger.conditions[j]);
            }
          }
        }

        let conditionPromises = [];
        if (firingConditions.length > 0) {
          let conditionPromise = this.HawkularAlert.Conditions.save({
              triggerId: savedTrigger.id,
              triggerMode: 'FIRING'
            },
            firingConditions).$promise.then(null, (error) => {
              return this.ErrorsManager.errorHandler(error, 'Error creating firing conditions.', errorCallback);
            });
          conditionPromises.push(conditionPromise);
        }
        if (autoResolveConditions.length > 0) {
          let conditionPromise = this.HawkularAlert.Conditions.save({
              triggerId: savedTrigger.id,
              triggerMode: 'AUTORESOLVE'
            },
            autoResolveConditions).$promise.then(null, (error) => {
              return this.ErrorsManager.errorHandler(error, 'Error creating autoresolve conditions.', errorCallback);
            });
          conditionPromises.push(conditionPromise);
        }

        return this.$q.all(Array.prototype.concat(dampeningPromises, conditionPromises));
      });

    }

    public deleteTrigger(triggerId:TriggerId):ng.IPromise<void> {
      return this.HawkularAlert.Trigger.delete({triggerId: triggerId}).$promise;
    }

    public updateTrigger(fullTrigger:any, errorCallback:any, backupTrigger?:any):ng.IPromise<any> {

      let emailPromise = this.addEmailAction(fullTrigger.trigger.actions.email[0]).then(()=> {
        if (angular.equals(fullTrigger.trigger, backupTrigger.trigger) || !fullTrigger.trigger) {
          return;
        }
        return this.HawkularAlert.Trigger.put({triggerId: fullTrigger.trigger.id}, fullTrigger.trigger).$promise;
      }, (error)=> {
        return this.ErrorsManager.errorHandler(error, 'Error saving email action.', errorCallback);
      });

      let triggerId = fullTrigger.trigger.id;

      let dampeningPromises = [];
      for (let i = 0; fullTrigger.dampenings && i < fullTrigger.dampenings.length; i++) {
        if (fullTrigger.dampenings[i] && !angular.equals(fullTrigger.dampenings[i], backupTrigger.dampenings[i])) {
          let dampeningId = fullTrigger.dampenings[i].dampeningId;
          let dampeningPromise = this.HawkularAlert.Dampening.put({triggerId: triggerId, dampeningId: dampeningId},
            fullTrigger.dampenings[i]).$promise.then(null, (error)=> {
              return this.ErrorsManager.errorHandler(error, 'Error saving dampening.', errorCallback);
            });

          dampeningPromises.push(dampeningPromise);
        }
      }

      let firingConditions = [];
      let autoResolveConditions = [];
      for (let j = 0; fullTrigger.conditions && j < fullTrigger.conditions.length; j++) {
        if (fullTrigger.conditions[j]) {
          if (fullTrigger.conditions[j].triggerMode && fullTrigger.conditions[j].triggerMode === 'AUTORESOLVE') {
            autoResolveConditions.push(fullTrigger.conditions[j]);
          } else {
            // A condition without triggerMode is treated as FIRING
            firingConditions.push(fullTrigger.conditions[j]);
          }
        }
      }

      let conditionPromises = [];
      if (firingConditions.length > 0) {
        let conditionPromise = this.HawkularAlert.Conditions.save({
            triggerId: triggerId,
            triggerMode: 'FIRING'
          },
          firingConditions).$promise.then(null, (error) => {
            return this.ErrorsManager.errorHandler(error, 'Error creating firing conditions.', errorCallback);
          });
        conditionPromises.push(conditionPromise);
      }
      if (autoResolveConditions.length > 0) {
        let conditionPromise = this.HawkularAlert.Conditions.save({
            triggerId: triggerId,
            triggerMode: 'AUTORESOLVE'
          },
          autoResolveConditions).$promise.then(null, (error) => {
            return this.ErrorsManager.errorHandler(error, 'Error creating autoresolve conditions.', errorCallback);
          });
        conditionPromises.push(conditionPromise);
      }

      return this.$q.all(Array.prototype.concat(emailPromise, dampeningPromises, conditionPromises));
    }

    public queryTriggers(criteria:IHawkularTriggerCriteria):ng.IPromise<IHawkularTriggerQueryResult> {
      let triggerList = [];
      let headers;

      /* Format of Triggers:

       trigger: {
       }

       */

      let queryParams = {};

      if (criteria && criteria.triggerIds) {
        queryParams['triggerIds'] = criteria.triggerIds;
      }

      if (criteria && criteria.tags) {
        queryParams['tags'] = criteria.tags;
      }

      if (criteria && criteria.thin) {
        queryParams['thin'] = criteria.thin;
      }

      if (criteria && criteria.currentPage && criteria.currentPage !== 0) {
        queryParams['page'] = criteria.currentPage;
      }

      if (criteria && criteria.perPage) {
        queryParams['per_page'] = criteria.perPage;
      }

      if (criteria && criteria.sort) {
        queryParams['sort'] = criteria.sort;
      }

      if (criteria && criteria.order) {
        queryParams['order'] = criteria.order;
      }

      return this.HawkularAlert.Trigger.query(queryParams, (serverTriggers:any, getHeaders:any) => {

        headers = getHeaders();
        let momentNow = this.$moment();

        for (let i = 0; i < serverTriggers.length; i++) {
          let serverTrigger = serverTriggers[i];
          let consoleTrigger:any = serverTrigger;

          triggerList.push(consoleTrigger);
        }
      }, (error) => {
        this.$log.debug('querying data error', error);
      }).$promise.then(():IHawkularTriggerQueryResult => {
          return {
            triggerList: triggerList,
            headers: headers
          };
        });
    }

    private getEmailAction(email:EmailType):ng.IPromise<void> {
      return this.HawkularAlert.Action.get({
        pluginId: 'email',
        actionId: email
      }).$promise;
    }

    private createEmailAction(email:EmailType):ng.IPromise<void> {
      return this.HawkularAlert.Action.save({
        actionPlugin: 'email',
        actionId: email,
        description: 'Created on ' + Date(),
        to: email
      }).$promise;
    }

    public addEmailAction(email:EmailType):ng.IPromise<void> {
      return this.getEmailAction(email).then((promiseValue:any) => {
        return promiseValue;
      }, (reason:any) => {
        // Create a default email action
        if (reason.status === 404) {
          this.$log.debug('Action does not exist, creating one');
          return this.createEmailAction(email);
        }
      });
    }

    public updateAction(email:EmailType):ng.IPromise<void> {
      return this.HawkularAlert.Action.put({
        actionPlugin: 'email',
        actionId: email,
        description: 'Created on ' + Date(),
        to: email
      }).$promise;
    }
  }

  _module.service('HawkularAlertsManager', HawkularAlertsManager);
}
