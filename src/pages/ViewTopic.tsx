import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Api, useHttp } from '../api';
import { Topic } from '../types/TopicType';
import { Editor } from '../components';
import { useNotification } from '../notification';
import { NotificationMessage } from '../api/HttpType';

function ViewTopic() {
  const { notify } = useNotification();
  const { topicId } = useParams();
  const { t } = useTranslation();
  const { httpGetSimple } = useHttp();
  const [topic, setTopic] = useState<Topic>();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (topicId) {
        const result = await httpGetSimple(Api.Topic.get(topicId));
        if (result.status === 'SUCCESS') {
          setTopic(result.data);
        } else {
          let errorMessage = '';
          result.messages?.forEach((message: NotificationMessage) => {
            errorMessage += message.message + '\n';
          });

          setErrorMessage(t('topic.viewTopic.error.loadingTopicError', { errorMessage }));
          result.messages?.forEach((message: NotificationMessage) => {
            notify(message.type, message.message);
          });
        }
      } else {
        const message: string = t('topic.viewTopic.error.missingTopicIdInUrl');
        setErrorMessage(message);
        notify('ERROR', message);
      }
    } catch (error) {
      setErrorMessage(t('topic.viewTopic.error.loadingTopicError', {
        errorMessage: (error?.toString() || ''),
      }));
      notify('ERROR', t('global.error.unexpectedError'));
    } finally {
      setLoading(false);
    }
  }, [httpGetSimple, t, notify, topicId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    loading
      ? (
          <ProgressSpinner />
        )
      : topic
        ? (
            <>
              <h1>
                {topic?.title}
              </h1>
              <Editor
                text={topic?.text}
                key={topic?.text}
                style={{ height: '100%' }}
                readOnly
                showHeader={false}
              />
            </>
          )
        : (
            <Message
              aria-label="error-message"
              severity="error"
              text={errorMessage}
            />
          )
  );
}

export default ViewTopic;
