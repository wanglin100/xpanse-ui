/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricItem } from './MetricItem';

export type Metric = {
    /**
     * The name of the metric.
     */
    name: string;
    /**
     * The description of the metric.
     */
    description?: string;
    /**
     * The type of the metric.
     */
    type: Metric.type;
    /**
     * The unit of the metric.
     */
    unit: Metric.unit;
    /**
     * The labels of the metric.
     */
    labels?: Record<string, string>;
    /**
     * The list of the metric items.
     */
    metrics?: Array<MetricItem>;
};

export namespace Metric {
    /**
     * The type of the metric.
     */
    export enum type {
        COUNTER = 'counter',
        GAUGE = 'gauge',
        HISTOGRAM = 'histogram',
        SUMMARY = 'summary',
    }

    /**
     * The unit of the metric.
     */
    export enum unit {
        MB = 'mb',
        KB = 'kb',
        PERCENTAGE = 'percentage',
        BIT_S = 'bit/s',
        BYTE_S = 'Byte/s',
    }
}
