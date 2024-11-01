import {useCallback, useEffect, useState} from 'react';
import {Button} from 'primereact/button';
import Editor from '../components/Editor';
import {Api, useHttp} from '../api';
import {useNavigate, useParams} from 'react-router-dom';
import _ from 'lodash';
import {InputText} from 'primereact/inputtext';
import {useTranslation} from 'react-i18next';
import {useNotification} from '../notification';
import {SimplifiedResponse} from '../api/HttpType';
import {ProgressSpinner} from 'primereact/progressspinner';

type FormData = {
  id: any;
  title: string;
  text: string;
};

type UseParams = {
  topicId: string;
};

export default function EditTopic() {
  const [backendData, setBackendData] = useState<FormData>({
    id: undefined,
    title: '',
    text: '',
  });
  const [formData, setFormData] = useState<FormData>({
    id: undefined,
    title: '',
    text: '',
  });
  const {topicId} = useParams<UseParams>();
  const {httpGetSimple, httpPostSimple, httpPutSimple} = useHttp();
  const {t} = useTranslation();
  const {notifySuccess, notifyError} = useNotification();
  const navigate = useNavigate();

  const reset = useCallback(() => {
    setBackendData({
      id: undefined,
      title: '',
      text: '',
    });
    setFormData({
      id: undefined,
      title: '',
      text: '',
    });
  }, []);

  const loadFormData = useCallback(async () => {
    if (topicId && topicId !== 'add') {
      const response: SimplifiedResponse | undefined = await httpGetSimple(
        Api.Topic.get(topicId),
      );
      if (response) {
        if (response.status === 'SUCCESS') {
          setBackendData({...response?.data});
          setFormData(_.cloneDeep(response?.data));
        } else {
          response.messages?.forEach((message: string) => {
            notifyError(message);
          });
        }
      }
    }
  }, [httpGetSimple, notifyError, topicId]);

  const onChange = (param: string, value: any) => {
    const newFormData: FormData = _.cloneDeep(formData);
    newFormData[param as keyof FormData] = value;
    setFormData(newFormData);
  };

  const onSave = async () => {
    if (topicId === 'add') {
      const response: SimplifiedResponse | undefined = await httpPostSimple(
        Api.Topic.create(),
        formData,
      );
      if (response) {
        if (response.status === 'SUCCESS') {
          navigate(`/`);
        } else {
          response.messages?.forEach((message: string) => {
            notifyError(message);
          });
        }
      }
    } else if (topicId != null) {
      const response: SimplifiedResponse | undefined = await httpPutSimple(
        Api.Topic.update(topicId),
        formData,
      );
      if (response) {
        if (response.status === 'SUCCESS') {
          notifySuccess(t('notification.success'));
        } else {
          response.messages?.forEach((message: string) => {
            notifyError(message);
          });
        }
      }
    }
  };

  const onCancel = async () => {
    setFormData(_.cloneDeep(backendData));
  };

  useEffect(() => {
    reset();
    loadFormData();
  }, [loadFormData, reset, topicId]);

  return (
    <>
      <h1>
        {topicId && topicId === 'add'
          ? t('topic.editTopic.title.add')
          : t('topic.editTopic.title.edit')}
      </h1>
      {topicId === null || topicId === undefined || formData?.id ? (
        <div className="grid">
          <div className="field col-12">
            <label className="col-12 field-label">
              {t('topic.editTopic.form.titleField.label')}
            </label>
            <InputText
              type="text"
              className="col-12"
              placeholder={t('topic.editTopic.form.titleField.placeHolder')}
              value={formData?.title}
              onChange={(e: any) => onChange('title', e.target.value)}
            />
          </div>
          <div className="field col-12">
            <label className="col-12 field-label">
              {t('topic.editTopic.form.textField.label')}
            </label>
            <Editor
              text={formData?.text}
              key={formData?.id}
              className="col-12"
              placeholder={t('topic.editTopic.form.textField.placeHolder')}
              onText={(value: any) => onChange('text', value)}
            />
          </div>
          <div className="col-12 form-button-bar">
            <div className="flex justify-content-end flex-wrap">
              <Button
                className="mr-2"
                label={t('topic.editTopic.buttons.submit')}
                severity="success"
                onClick={onSave}
              />
              {topicId != null && (
                <Button
                  label={t('topic.editTopic.buttons.cancel')}
                  severity="danger"
                  onClick={onCancel}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <ProgressSpinner />
      )}
    </>
  );
}
