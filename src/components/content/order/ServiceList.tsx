/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ServiceDetailVo, ServiceService, ServiceVo } from '../../../xpanse-api/generated';
import { ColumnFilterItem } from 'antd/es/table/interface';
import { CloseCircleOutlined, CopyOutlined, ExpandAltOutlined, SyncOutlined } from '@ant-design/icons';
import '../../../styles/service_instance_list.css';
import { sortVersionNum } from '../../utils/Sort';
import { MyServiceDetails } from './MyServiceDetails';
import { usernameKey } from '../../utils/constants';

// 1 hour.
const destroyTimeout: number = 3600000;
// 5 seconds.
const waitServicePeriod: number = 3000;

function ServiceList(): JSX.Element {
    const [serviceVoList, setServiceVoList] = useState<ServiceVo[]>([]);
    const [versionFilters, setVersionFilters] = useState<ColumnFilterItem[]>([]);
    const [nameFilters, setNameFilters] = useState<ColumnFilterItem[]>([]);
    const [customerServiceNameFilters, setCustomerServiceNameFilters] = useState<ColumnFilterItem[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<ColumnFilterItem[]>([]);
    const [cspFilters, setCspFilters] = useState<ColumnFilterItem[]>([]);
    const [serviceStateFilters, setServiceStateFilters] = useState<ColumnFilterItem[]>([]);
    const [tip, setTip] = useState<JSX.Element | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [id, setId] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [content, setContent] = useState<Map<string, string>>(new Map());
    const [requestParams, setRequestParams] = useState<Map<string, string>>(new Map());

    const columns: ColumnsType<ServiceVo> = [
        {
            title: 'Id',
            dataIndex: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'customerServiceName',
            filters: customerServiceNameFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: string | number | boolean, record) => {
                if (record.customerServiceName !== undefined) {
                    const customerServiceName = record.customerServiceName;
                    return customerServiceName.startsWith(value.toString());
                }
                return false;
            },
        },
        {
            title: 'Category',
            dataIndex: 'category',
            filters: categoryFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: string | number | boolean, record) => record.category.startsWith(value.toString()),
        },
        {
            title: 'Service',
            dataIndex: 'name',
            filters: nameFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: string | number | boolean, record) => record.name.startsWith(value.toString()),
        },
        {
            title: 'Version',
            dataIndex: 'version',
            filters: versionFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: string | number | boolean, record) => record.version.startsWith(value.toString()),
            sorter: (service1, service2) => sortVersionNum(service1.version, service2.version),
        },
        {
            title: 'Csp',
            dataIndex: 'csp',
            filters: cspFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: string | number | boolean, record) => record.csp.startsWith(value.toString()),
        },
        {
            title: 'Flavor',
            dataIndex: 'flavor',
        },
        {
            title: 'ServiceState',
            dataIndex: 'serviceState',
            filters: serviceStateFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: string | number | boolean, record) => record.csp.startsWith(value.toString()),
        },
        {
            title: 'Operation',
            dataIndex: 'operation',
            render: (text: string, record: ServiceVo) => {
                return (
                    <>
                        <Space size='middle'>
                            <Button
                                type='primary'
                                icon={<CopyOutlined />}
                                disabled={!(record.serviceState === ServiceVo.serviceState.DEPLOY_SUCCESS && !loading)}
                            >
                                migrate
                            </Button>
                            <Button
                                loading={record.id === id ? loading : false}
                                type='primary'
                                icon={<CloseCircleOutlined />}
                                onClick={() => destroy(record)}
                                disabled={!(record.serviceState === ServiceVo.serviceState.DEPLOY_SUCCESS && !loading)}
                            >
                                destroy
                            </Button>
                            <Button
                                type='primary'
                                icon={<ExpandAltOutlined />}
                                onClick={() => getDeployedProperties(record.id)}
                                disabled={!(record.serviceState === ServiceVo.serviceState.DEPLOY_SUCCESS && !loading)}
                            >
                                detail
                            </Button>
                        </Space>
                    </>
                );
            },
        },
    ];

    function Tip(type: 'error' | 'success', msg: string) {
        setTip(
            <div className={'submit-alert-tip'}>
                {' '}
                <Alert message='Destroy:' description={msg} showIcon type={type} />{' '}
            </div>
        );
    }

    function TipClear() {
        setTip(undefined);
    }

    function waitingServiceDestroy(uuid: string, timeout: number, date: Date) {
        Tip(
            'success',
            'Destroying, Please wait... [' + Math.ceil((new Date().getTime() - date.getTime()) / 1000).toString() + 's]'
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ServiceService.getDeployedServiceDetailsById(uuid, localStorage.getItem(usernameKey)!)
            .then((response) => {
                if (response.serviceState === ServiceDetailVo.serviceState.DESTROY_SUCCESS) {
                    Tip('success', 'Destroy success.');
                    setLoading(false);
                    refreshData();
                    TipClear();
                } else if (response.serviceState === ServiceDetailVo.serviceState.DESTROY_FAILED) {
                    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                    Tip('error', 'Destroy failed:' + response.resultMessage);
                    setLoading(false);
                    TipClear();
                } else {
                    setTimeout(() => {
                        waitingServiceDestroy(uuid, timeout - waitServicePeriod, date);
                    }, waitServicePeriod);
                }
            })
            .catch((e: Error) => {
                Tip('error', 'Destroy failed:' + e.message);
                setLoading(false);
                TipClear();
            });
    }

    function destroy(record: ServiceVo) {
        setId(record.id);
        setLoading(true);
        ServiceService.destroy(record.id)
            .then(() => {
                waitingServiceDestroy(record.id, destroyTimeout, new Date());
                refreshData();
            })
            .catch((e: Error) => {
                Tip('error', 'Destroy failed:' + e.message);
                setLoading(false);
                TipClear();
            });
    }

    function getDeployedProperties(id: string): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ServiceService.getDeployedServiceDetailsById(id, localStorage.getItem(usernameKey)!)
            .then((response) => {
                const endPointMap = new Map<string, string>();
                const requestMap = new Map<string, string>();
                if (response.deployedServiceProperties) {
                    for (const key in response.deployedServiceProperties) {
                        endPointMap.set(key, response.deployedServiceProperties[key]);
                    }
                }
                if (response.createRequest.serviceRequestProperties) {
                    for (const key in response.createRequest.serviceRequestProperties) {
                        requestMap.set(key, response.createRequest.serviceRequestProperties[key]);
                    }
                }
                setContent(endPointMap);
                setRequestParams(requestMap);
                setIsModalOpen(true);
            })
            .catch((e: Error) => {
                console.log(e.message);
                setIsModalOpen(false);
            });
    }

    function updateCspFilters(resp: ServiceVo[]): void {
        const filters: ColumnFilterItem[] = [];
        const cspSet = new Set<string>('');
        resp.forEach((v) => {
            cspSet.add(v.csp);
        });
        cspSet.forEach((csp) => {
            const filter = {
                text: csp,
                value: csp,
            };
            filters.push(filter);
        });
        setCspFilters(filters);
    }

    function updateCategoryFilters(resp: ServiceVo[]): void {
        const filters: ColumnFilterItem[] = [];
        const categorySet = new Set<string>('');
        resp.forEach((v) => {
            categorySet.add(v.category);
        });
        categorySet.forEach((category) => {
            const filter = {
                text: category,
                value: category,
            };
            filters.push(filter);
        });
        setCategoryFilters(filters);
    }

    function updateVersionFilters(resp: ServiceVo[]): void {
        const filters: ColumnFilterItem[] = [];
        const versionSet = new Set<string>('');
        resp.forEach((v) => {
            versionSet.add(v.version);
        });
        versionSet.forEach((version) => {
            const filter = {
                text: version,
                value: version,
            };
            filters.push(filter);
        });
        setVersionFilters(filters);
    }

    function updateNameFilters(resp: ServiceVo[]): void {
        const filters: ColumnFilterItem[] = [];
        const nameSet = new Set<string>('');
        resp.forEach((v) => {
            nameSet.add(v.name);
        });
        nameSet.forEach((name) => {
            const filter = {
                text: name,
                value: name,
            };
            filters.push(filter);
        });
        setNameFilters(filters);
    }

    function updateCustomerServiceNameFilters(resp: ServiceVo[]): void {
        const filters: ColumnFilterItem[] = [];
        const customerServiceNameSet = new Set<string>('');
        resp.forEach((v) => {
            if (v.customerServiceName) {
                customerServiceNameSet.add(v.customerServiceName);
            }
        });
        customerServiceNameSet.forEach((name) => {
            const filter = {
                text: name,
                value: name,
            };
            filters.push(filter);
        });
        setCustomerServiceNameFilters(filters);
    }

    function updateServiceStateFilters(resp: ServiceVo[]): void {
        const filters: ColumnFilterItem[] = [];
        const serviceStateSet = new Set<string>('');
        resp.forEach((v) => {
            serviceStateSet.add(v.serviceState);
        });
        serviceStateSet.forEach((serviceState) => {
            const filter = {
                text: serviceState,
                value: serviceState,
            };
            filters.push(filter);
        });
        setServiceStateFilters(filters);
    }

    function getServices(): void {
        const userName: string | null = localStorage.getItem(usernameKey);
        if (!userName) {
            return;
        }
        void ServiceService.getDeployedServicesByUser(userName).then((resp) => {
            const serviceList: ServiceVo[] = [];
            if (resp.length > 0) {
                setServiceVoList(resp);
                updateVersionFilters(resp);
                updateNameFilters(resp);
                updateCategoryFilters(resp);
                updateCspFilters(resp);
                updateCustomerServiceNameFilters(resp);
                updateServiceStateFilters(resp);
            } else {
                setServiceVoList(serviceList);
            }
        });
    }

    useEffect(() => {
        getServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function refreshData(): void {
        getServices();
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={'services-content'}>
            {tip}
            <Modal title={'Service Details'} width={700} footer={null} open={isModalOpen} onCancel={handleCancel}>
                <MyServiceDetails endPointInfo={content} requestParamsInfo={requestParams} />
            </Modal>

            <div>
                <Button
                    disabled={loading}
                    type='primary'
                    icon={<SyncOutlined />}
                    onClick={() => {
                        refreshData();
                    }}
                >
                    refresh
                </Button>
            </div>
            <div className={'service-instance-list'}>
                <Table columns={columns} dataSource={serviceVoList} />
            </div>
        </div>
    );
}

export default ServiceList;
