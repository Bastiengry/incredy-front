import {useCallback, useEffect, useState} from 'react';
import {Api, useHttp} from '../api';
import {useParams} from 'react-router-dom';
import {Topic} from '../types/TopicType';
import {Editor} from '../components';

function ViewTopic() {
  const {httpGetSimple} = useHttp();
  const [topic, setTopic] = useState<Topic>();
  const {topicId} = useParams();

  const findTopic = useCallback(
    async (topicId: string | number) => {
      const result = await httpGetSimple(Api.Topic.get(topicId));
      if (result?.data) {
        setTopic(result.data);
      }
    },
    [httpGetSimple],
  );

  useEffect(() => {
    if (topicId != null) {
      findTopic(topicId);
    }
  }, [findTopic, topicId]);

  return (
    <h1>
      {topic?.title}
      <Editor
        text={topic?.text}
        key={topic?.text}
        style={{height: '100%'}}
        readOnly
        showHeader={false}
      />
    </h1>
  );
}

export default ViewTopic;
