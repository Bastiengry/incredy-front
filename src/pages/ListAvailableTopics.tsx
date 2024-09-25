import {useState, useEffect, ChangeEvent, useCallback} from 'react';
import {DataTable, DataTableFilterMeta} from 'primereact/datatable';
import {ProgressSpinner} from 'primereact/progressspinner';
import {Column} from 'primereact/column';
import {Api} from '../api';
import {useNavigate} from 'react-router-dom';
import {Topic} from '../types/TopicType';
import {FilterMatchMode} from 'primereact/api';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {IconField} from 'primereact/iconfield';
import {InputIcon} from 'primereact/inputicon';
import _ from 'lodash';
import {Dialog} from 'primereact/dialog';
import {useNotification} from '../notification';
import {useHttp} from '../api';
import {useTranslation} from 'react-i18next';
import {SimplifiedResponse} from '../api/HttpType';
import {useKeycloak} from '@react-keycloak/web';

export default function ListAvailableTopics() {
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<Topic>();
  const [openModalDeleteTopic, setOpenModalDeleteTopic] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DataTableFilterMeta | undefined>();
  const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
  const {notifyError} = useNotification();
  const {httpDelete, httpGetSimple} = useHttp();
  const {t} = useTranslation();
  const {keycloak} = useKeycloak();

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
    if (topic?.id != null) {
      navigate(`/edittopic/${topic.id}`);
    }
  };

  const deleteTopic = async (topic: Topic) => {
    if (topic?.id != null) {
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
    if (topic?.id != null) {
      navigate(`/viewtopic/${topic.id}`);
    }
  };

  const actionsBodyTemplate = (topic: Topic) => {
    return (
      <>
        <Button
          icon="pi pi-eye"
          rounded
          severity="info"
          style={{marginRight: '5px'}}
          onClick={() => viewTopic(topic)}
        />
        {keycloak?.tokenParsed?.sub === topic?.creatorUser && (
          <>
            <Button
              icon="pi pi-pencil"
              rounded
              severity="warning"
              style={{marginRight: '5px'}}
              onClick={() => editTopic(topic)}
            />
            <Button
              icon="pi pi-trash"
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

    let _filters = _.cloneDeep(filters);
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
    const response: SimplifiedResponse | undefined = await httpGetSimple(
      Api.Topic.getAll(),
    );
    console.log('response', response);
    if (response) {
      if (response.status === 'SUCCESS') {
        setTopics(response?.data);
      } else {
        setTopics(null);
        response.messages?.forEach((message: string) => {
          notifyError(message);
        });
      }
    }
  }, [notifyError, httpGetSimple]);

  useEffect(() => {
    findAllTopics();
  }, [findAllTopics]);

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label={t('topic.listTopics.clear')}
          outlined
          onClick={clearFilter}
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
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
    const topic = _.cloneDeep(topicToDelete);
    setTopicToDelete(undefined);
    await deleteTopic(topic!);
    findAllTopics();
  };

  const deleteTopicModalFooter = (
    <>
      <Button
        label={t('topic.listTopics.deleteConfirmDialog.buttons.no')}
        icon="pi pi-times"
        outlined
        onClick={deleteModalDeleteTopicCancelled}
      />
      <Button
        label={t('topic.listTopics.deleteConfirmDialog.buttons.yes')}
        icon="pi pi-check"
        severity="danger"
        onClick={deleteModalDeleteTopicConfirmed}
      />
    </>
  );
  console.log('topics', topics);
  return (
    <>
      <h1>{t('topic.listTopics.title')}</h1>
      {topics != null ? (
        <>
          <DataTable
            header={renderHeader}
            value={topics}
            dataKey="id"
            selectionMode="single"
            onSelectionChange={e => viewTopic(e.value)}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
            filters={filters}
            globalFilterFields={['title']}>
            <Column
              field="title"
              header={t('topic.listTopics.columns.topic')}
              sortable
              body={titleBodyTemplate}
            />
            <Column
              header={t('topic.listTopics.columns.actions')}
              body={actionsBodyTemplate}
              style={{width: '200px'}}
            />
          </DataTable>
          <Dialog
            visible={openModalDeleteTopic}
            header={t('topic.listTopics.deleteConfirmDialog.title')}
            modal
            footer={deleteTopicModalFooter}
            onHide={hideModalDeleteTopic}>
            <div className="confirmation-content">
              <i
                className="pi pi-exclamation-triangle mr-3"
                style={{fontSize: '2rem'}}
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
      ) : (
        <ProgressSpinner />
      )}
    </>
  );
}
