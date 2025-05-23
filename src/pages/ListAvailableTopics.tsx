import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { useTranslation } from 'react-i18next';
import { useKeycloak } from '../keycloak';
import { Topic } from '../types/Topic';
import { Api } from '../api';
import { useNotification } from '../notification';
import { useHttp, HttpResponseMessage, SimplifiedResponse } from '../http';

export default function ListAvailableTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicToDelete, setTopicToDelete] = useState<Topic>();
  const [openModalDeleteTopic, setOpenModalDeleteTopic] = useState<boolean>(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DataTableFilterMeta | undefined>();
  const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
  const { notify } = useNotification();
  const { httpDelete, httpGetSimple } = useHttp();
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const [emptyMessageDataTable, setEmptyMessageDataTable] = useState(
    t('topic.listTopics.error.nodata'),
  );
  const [loading, setLoading] = useState(true);

  const titleBodyTemplate = (rowData: Topic) => {
    return (
      <div className="flex flex-column">
        <div className="col-12 topic-list-title">{rowData?.title}</div>
        <div className="col-12 topic-list-date">
          {rowData?.createdDate
            ? new Date(rowData?.createdDate).toLocaleString()
            : null}
        </div>
      </div>
    );
  };

  const editTopic = (topic: Topic) => {
    if (topic.id || topic.id === 0) {
      navigate(`/edittopic/${topic.id}`);
    }
  };

  const deleteTopic = async (topic: Topic | undefined) => {
    if (topic?.id || topic?.id === 0) {
      await httpDelete(Api.Topic.delete(topic.id));
    }
  };

  const askConfirmationDeleteTopic = (topic: Topic) => {
    setTopicToDelete(topic);
    setOpenModalDeleteTopic(true);
  };

  const hideModalDeleteTopic = () => {
    setOpenModalDeleteTopic(false);
  };

  const deleteModalDeleteTopicCancelled = () => {
    setOpenModalDeleteTopic(false);
    setTopicToDelete(undefined);
  };

  const viewTopic = (topic: Topic) => {
    if (topic.id || topic.id === 0) {
      navigate(`/viewtopic/${topic.id}`);
    }
  };

  const actionsBodyTemplate = (topic: Topic) => {
    return (
      <>
        <Button
          icon="pi pi-eye"
          aria-label="pi-eye"
          name="view-topic"
          rounded
          severity="info"
          style={{ marginRight: '5px' }}
          onClick={() => viewTopic(topic)}
        />
        {keycloak?.tokenParsed?.sub === topic?.creatorUser && (
          <>
            <Button
              icon="pi pi-pencil"
              aria-label="pi-pencil"
              name="edit-topic"
              rounded
              severity="warning"
              style={{ marginRight: '5px' }}
              onClick={() => editTopic(topic)}
            />
            <Button
              icon="pi pi-trash"
              aria-label="pi-trash"
              name="delete-topic"
              rounded
              severity="danger"
              onClick={() => askConfirmationDeleteTopic(topic)}
            />
          </>
        )}
      </>
    );
  };

  const clearFilter = () => {
    setFilters(undefined);
    setGlobalFilterValue('');
  };

  const onGlobalFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    let _filters = structuredClone(filters);
    if (!_filters) {
      _filters = {};
    }
    _filters.global = {
      value: value,
      matchMode: FilterMatchMode.CONTAINS,
    };

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const findAllTopics = useCallback(async () => {
    try {
      setEmptyMessageDataTable('');
      setLoading(true);
      setTopics([]);

      try {
        const response: SimplifiedResponse = await httpGetSimple(
          Api.Topic.getAll(),
        );

        if (response.status === 'SUCCESS') {
          setEmptyMessageDataTable(t('topic.listTopics.error.nodata'));
          setTopics((response?.data || []) as Topic[]);
        } else {
          setEmptyMessageDataTable(t('topic.listTopics.error.errorLoading'));
          response.messages?.forEach((message: HttpResponseMessage) => {
            notify(message.type, message.message);
          });
        }
      } catch (error) {
        setEmptyMessageDataTable(t('topic.listTopics.error.errorLoading'));
        notify('ERROR', error?.toString() || t('global.error.unexpectedError'));
      }
    } finally {
      setLoading(false);
    }
  }, [notify, httpGetSimple, t]);

  useEffect(() => {
    findAllTopics();
  }, [findAllTopics]);

  const renderHeader = () => {
    return (
      <div aria-label="filter" className="flex justify-content-between">
        <Button
          aria-label="filter-button-clear"
          type="button"
          icon="pi pi-filter-slash"
          label={t('topic.listTopics.clear')}
          outlined
          onClick={clearFilter}
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            aria-label="filter-text"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder={t('topic.listTopics.search')}
          />
        </IconField>
      </div>
    );
  };

  const deleteModalDeleteTopicConfirmed = async () => {
    setOpenModalDeleteTopic(false);
    const topic = structuredClone(topicToDelete);
    setTopicToDelete(undefined);
    await deleteTopic(topic);
    findAllTopics();
  };

  const deleteTopicModalFooter = (
    <>
      <Button
        label={t('topic.listTopics.deleteConfirmDialog.buttons.no')}
        icon="pi pi-times"
        outlined
        name="no-button"
        aria-label="no-button"
        onClick={deleteModalDeleteTopicCancelled}
      />
      <Button
        label={t('topic.listTopics.deleteConfirmDialog.buttons.yes')}
        icon="pi pi-check"
        severity="danger"
        name="yes-button"
        aria-label="yes-button"
        onClick={deleteModalDeleteTopicConfirmed}
      />
    </>
  );

  return (
    <>
      <h1>{t('topic.listTopics.title')}</h1>
      {
        loading
          ? (
              <ProgressSpinner />
            )
          : (
              <>
                <DataTable
                  header={renderHeader}
                  id="list-topics"
                  data-testid="datatable"
                  value={topics}
                  dataKey="id"
                  selectionMode="single"
                  onSelectionChange={e => viewTopic(e.value)}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  filters={filters}
                  emptyMessage={emptyMessageDataTable}
                  aria-label="topic-datatable"
                  globalFilterFields={['title']}
                >
                  <Column
                    field="title"
                    header={t('topic.listTopics.columns.topic')}
                    sortable
                    body={titleBodyTemplate}
                  />
                  <Column
                    field="actions"
                    header={t('topic.listTopics.columns.actions')}
                    body={actionsBodyTemplate}
                    style={{ width: '200px' }}
                  />
                </DataTable>
                <Dialog
                  visible={openModalDeleteTopic}
                  header={t('topic.listTopics.deleteConfirmDialog.title')}
                  modal
                  pt={{
                    root: () => ({
                      'aria-label': 'delete-dialog',
                      'id': 'delete-dialog',
                    }),
                    closeButton: () => ({
                      'aria-label': 'delete-dialog-close-button',
                    }),
                  }}
                  footer={deleteTopicModalFooter}
                  onHide={hideModalDeleteTopic}
                >
                  <div className="confirmation-content">
                    <i
                      className="pi pi-exclamation-triangle mr-3"
                      style={{ fontSize: '2rem' }}
                    />
                    {topicToDelete && (
                      <span>
                        {t('topic.listTopics.deleteConfirmDialog.message', {
                          topicToDelete: topicToDelete.title,
                        })}
                      </span>
                    )}
                  </div>
                </Dialog>
              </>
            )
      }
    </>
  );
}
