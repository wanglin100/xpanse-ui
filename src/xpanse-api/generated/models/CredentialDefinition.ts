/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CredentialVariable } from './CredentialVariable';

export type CredentialDefinition = {
    /**
     * The cloud service provider of the credential.
     */
    csp: CredentialDefinition.csp;
    /**
     * The user who create the credential.
     */
    xpanseUser: string;
    /**
     * The name of the credential,this field is provided by  he the plugin of cloud service provider.
     */
    name: string;
    /**
     * The description of the credential,this field is provided by  he the plugin of cloud service provider.
     */
    description: string;
    /**
     * The type of the credential,this field is provided by  he the plugin of cloud service provider.
     */
    type: CredentialDefinition.type;
    /**
     * The variables list of the credential.
     */
    variables: Array<CredentialVariable>;
};

export namespace CredentialDefinition {
    /**
     * The cloud service provider of the credential.
     */
    export enum csp {
        HUAWEI = 'huawei',
        FLEXIBLE_ENGINE = 'flexibleEngine',
        OPENSTACK = 'openstack',
        ALICLOUD = 'alicloud',
        AWS = 'aws',
        AZURE = 'azure',
        GOOGLE = 'google',
    }

    /**
     * The type of the credential,this field is provided by  he the plugin of cloud service provider.
     */
    export enum type {
        VARIABLES = 'variables',
        HTTP_AUTHENTICATION = 'http_authentication',
        API_KEY = 'api_key',
        OAUTH2 = 'oauth2',
    }
}
