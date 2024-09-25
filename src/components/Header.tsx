import {Menubar} from 'primereact/menubar';
import {MenuItem} from 'primereact/menuitem';
import {useNavigate} from 'react-router-dom';
import {SplitButton} from 'primereact/splitbutton';
import {useKeycloak} from '@react-keycloak/web';
import {useTranslation} from 'react-i18next';

export default function Header() {
  const navigate = useNavigate();
  const {keycloak} = useKeycloak();
  const {t} = useTranslation();

  const items: MenuItem[] = [
    {
      label: t('header.menu.home.label'),
      icon: 'pi pi-home',
      command: () => {
        navigate('/');
      },
    },
  ];

  if (keycloak.authenticated) {
    items.push({
      label: t('header.menu.addTopic.label'),
      icon: 'pi pi-file-plus',
      command: () => {
        navigate('/edittopic/add');
      },
    });
  }

  const start = (
    <img
      alt="logo"
      src="https://primefaces.org/cdn/primereact/images/logo.png"
      height="40"
      className="mr-2"></img>
  );
  const end = (
    <div className="flex align-items-center gap-2">
      {!!keycloak.authenticated && (
        <>
          <SplitButton
            label={keycloak?.tokenParsed?.preferred_username}
            icon="pi pi-user"
            onClick={() => {}}
            className="user-button"
            model={[
              {
                label: t('header.menu.logout.label'),
                command: () => {
                  keycloak.logout();
                },
              },
            ]}
            text
            severity="secondary"
          />
        </>
      )}
      {!keycloak.authenticated && (
        <button
          className="p-link inline-flex justify-content-center align-items-center h-3rem w-3rem border-circle hover:bg-white-alpha-10 transition-all transition-duration-200"
          onClick={() => keycloak.login()}>
          <i className="pi pi-user text-1xl"></i>
        </button>
      )}
    </div>
  );

  return (
    <div className="card">
      <Menubar model={items} start={start} end={end} />
    </div>
  );
}
