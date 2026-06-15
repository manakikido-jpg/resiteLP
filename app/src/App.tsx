import { useApp } from "./store/AppStore";
import { Icon } from "./components/ui/Icon";
import { ListView } from "./components/list/ListView";
import { ScheduleView } from "./components/schedule/ScheduleView";
import { FormBuilderView } from "./components/form/FormBuilderView";
import { ProfileView } from "./components/profile/ProfileView";

export function App() {
  const { view, toast, loading } = useApp();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="saver saving">
          <span className="dot" />
          読み込み中…
        </span>
      </div>
    );
  }

  return (
    <>
      {view.name === "list" && <ListView />}
      {view.name === "schedule" && <ScheduleView />}
      {view.name === "form" && <FormBuilderView />}
      {view.name === "profile" && <ProfileView key={view.id} id={view.id} />}
      {toast && (
        <div className="toast">
          <Icon name="check" size={16} />
          {toast}
        </div>
      )}
    </>
  );
}
