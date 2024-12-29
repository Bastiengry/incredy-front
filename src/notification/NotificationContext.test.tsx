import { render, screen, within } from '@testing-library/react';
import { NotificationProvider } from './NotificationContext';
import useNotification from './useNotification';
import { PrimeReactProvider } from 'primereact/api';
import { useEffect } from 'react';

const TestComponent = function TestComp({
  notificationType,
  message,
}: {
  notificationType?: 'ERROR' | 'SUCCESS' | 'INFO' | undefined;
  message?: string;
}) {
  const { notify } = useNotification();

  useEffect(() => {
    if (message) {
      notify(notificationType, message);
    }
  }, []);
  return (
    <div aria-label="test-component"></div>
  );
};

describe('The NotificationContext component ', () => {
  it('displays well', async () => {
    render(
      <PrimeReactProvider>
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      </PrimeReactProvider>,
    );

    const notifComponent = await screen.findByLabelText('notif-component');
    expect(notifComponent).toHaveTextContent('');
  });

  it('must trigger error notification when notification type is error', async () => {
    render(
      <PrimeReactProvider>
        <NotificationProvider>
          <TestComponent notificationType="ERROR" message="notifErrorMessage" />
        </NotificationProvider>
      </PrimeReactProvider>,
    );

    const notifComponent = await screen.findByLabelText('notif-component');

    // Find the notification title component.
    const notifTitleComponent = await within(notifComponent).findByText('Error');
    expect(notifTitleComponent.className).toEqual('p-toast-summary');

    // Find the notification text component.
    const notifTextComponent = await within(notifComponent).findByText('notifErrorMessage');
    expect(notifTextComponent.className).toEqual('p-toast-detail');
  });

  it('must trigger success notification when notification type is success', async () => {
    render(
      <PrimeReactProvider>
        <NotificationProvider>
          <TestComponent notificationType="SUCCESS" message="notifSuccessMessage" />
        </NotificationProvider>
      </PrimeReactProvider>,
    );

    const notifComponent = await screen.findByLabelText('notif-component');

    // Find the notification title component.
    const notifTitleComponent = await within(notifComponent).findByText('Success');
    expect(notifTitleComponent.className).toEqual('p-toast-summary');

    // Find the notification text component.
    const notifTextComponent = await within(notifComponent).findByText('notifSuccessMessage');
    expect(notifTextComponent.className).toEqual('p-toast-detail');
  });

  it('must trigger info notification when notification type is info', async () => {
    render(
      <PrimeReactProvider>
        <NotificationProvider>
          <TestComponent notificationType="INFO" message="notifInfoMessage" />
        </NotificationProvider>
      </PrimeReactProvider>,
    );

    const notifComponent = await screen.findByLabelText('notif-component');

    // Find the notification title component.
    const notifTitleComponent = await within(notifComponent).findByText('Info');
    expect(notifTitleComponent.className).toEqual('p-toast-summary');

    // Find the notification text component.
    const notifTextComponent = await within(notifComponent).findByText('notifInfoMessage');
    expect(notifTextComponent.className).toEqual('p-toast-detail');
  });

  it('must trigger info notification when notification type is not defined', async () => {
    render(
      <PrimeReactProvider>
        <NotificationProvider>
          <TestComponent message="notifUndefMessage" />
        </NotificationProvider>
      </PrimeReactProvider>,
    );

    const notifComponent = await screen.findByLabelText('notif-component');

    // Find the notification title component.
    const notifTitleComponent = await within(notifComponent).findByText('Info');
    expect(notifTitleComponent.className).toEqual('p-toast-summary');

    // Find the notification text component.
    const notifTextComponent = await within(notifComponent).findByText('notifUndefMessage');
    expect(notifTextComponent.className).toEqual('p-toast-detail');
  });
});
