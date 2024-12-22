import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import Editor from '../components/Editor';
import { Api, useHttp } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import { InputText } from 'primereact/inputtext';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../notification';
import { NotificationMessage, SimplifiedResponse } from '../api/HttpType';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

interface FormData {
  [key: string]: string | number | undefined | null;
  id: number | undefined;
  title: string;
  text: string;
}

interface UseParams {
  [key: string]: string;
  topicId: string;
}

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
  const { topicId } = useParams<UseParams>();
  const [loading, setLoading] = useState<boolean>(true);
  const { httpGetSimple, httpPostSimple, httpPutSimple } = useHttp();
  const { t } = useTranslation();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isNumber = (value: string) => {
    const valNumber = parseInt(value);
    return !isNaN(valNumber) && isFinite(valNumber);
  };

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
    try {
      if (topicId && isNumber(topicId)) {
        const result: SimplifiedResponse | undefined = await httpGetSimple(
          Api.Topic.get(topicId),
        );
        if (result.status === 'SUCCESS') {
          setBackendData({ ...result.data } as FormData);
          setFormData(_.cloneDeep(result.data) as FormData);
        } else {
          let errorMessage = '';
          result.messages?.forEach((message: NotificationMessage) => {
            errorMessage += message.message + '\n';
          });

          setErrorMessage(t('topic.editTopic.error.loadingTopicError', { errorMessage }));
          result.messages?.forEach((message: NotificationMessage) => {
            notify(message.type, message.message);
          });
        }
      } else if (topicId !== 'add') {
        const message: string = t('topic.editTopic.error.missingTopicIdInUrl');
        setErrorMessage(message);
        notify('ERROR', message);
      }
    } catch (error) {
      setErrorMessage(t('topic.editTopic.error.loadingTopicError', {
        errorMessage: (error?.toString() || ''),
      }));
      notify('ERROR', t('global.error.unexpectedError'));
    } finally {
      setLoading(false);
    }
  }, [httpGetSimple, notify, t, topicId]);

  const onChange = (
    param: string,
    value: string | number | undefined | null,
  ) => {
    const newFormData: FormData = _.cloneDeep(formData);
    newFormData[param as keyof FormData] = value;
    setFormData(newFormData);
  };

  const onSave = async () => {
    try {
      if (topicId && isNumber(topicId)) {
        const response: SimplifiedResponse | undefined = await httpPutSimple(
          Api.Topic.update(topicId),
          formData,
        );
        if (response.status === 'SUCCESS') {
          notify('SUCCESS', t('notification.success'));
        } else {
          response.messages?.forEach((message: NotificationMessage) => {
            notify(message?.type, message.message);
          });
        }
      } else if (topicId === 'add') {
        const response: SimplifiedResponse | undefined = await httpPostSimple(
          Api.Topic.create(),
          formData,
        );
        if (response.status === 'SUCCESS') {
          navigate(`/`);
        } else {
          response.messages?.forEach((message: NotificationMessage) => {
            notify(message?.type, message.message);
          });
        }
      }
    } catch (error) {
      notify('ERROR', error?.toString() || t('global.error.unexpectedError'));
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
      {
        loading
          ? (
              <ProgressSpinner />
            )
          : formData?.id || topicId === 'add'
            ? (
                <div className="grid">
                  <div className="field col-12">
                    <label className="col-12 field-label">
                      {t('topic.editTopic.form.titleField.label')}
                    </label>
                    <InputText
                      aria-label="title"
                      name="title"
                      type="text"
                      className="col-12"
                      placeholder={t('topic.editTopic.form.titleField.placeHolder')}
                      value={formData?.title}
                      onChange={(e: React.FormEvent<HTMLInputElement>) =>
                        onChange('title', e.currentTarget.value)}
                    />
                  </div>
                  <div className="field col-12">
                    <label className="col-12 field-label">
                      {t('topic.editTopic.form.textField.label')}
                    </label>
                    <Editor
                      ariaLabel="editor"
                      text={formData?.text}
                      key={formData?.id}
                      className="col-12"
                      placeholder={t('topic.editTopic.form.textField.placeHolder')}
                      onText={(value: string | null) => onChange('text', value)}
                    />
                  </div>
                  <div className="col-12 form-button-bar">
                    <div className="flex justify-content-end flex-wrap">
                      <Button
                        id="btn-validate"
                        className="mr-2"
                        aria-label="submit"
                        label={t('topic.editTopic.buttons.submit')}
                        severity="success"
                        onClick={onSave}
                      />
                      {
                        topicId != null && (
                          <Button
                            id="btn-cancel"
                            label={t('topic.editTopic.buttons.cancel')}
                            aria-label="cancel"
                            severity="danger"
                            onClick={onCancel}
                          />
                        )
                      }
                    </div>
                  </div>
                </div>
              )
            : (
                <Message
                  aria-label="error-message"
                  severity="error"
                  text={errorMessage}
                />
              )
      }
    </>
  );
}
