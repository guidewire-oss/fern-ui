import {Refine,} from '@refinedev/core';
import {DevtoolsPanel, DevtoolsProvider} from "@refinedev/devtools";
import {RefineKbar, RefineKbarProvider} from "@refinedev/kbar";

import {ErrorComponent, ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2, useNotificationProvider} from '@refinedev/antd';
import "@refinedev/antd/dist/reset.css";

import {App as AntdApp} from "antd"
import {BrowserRouter, Outlet, Route, Routes} from "react-router-dom";
import routerBindings, {
    DocumentTitleHandler,
    NavigateToResource,
    UnsavedChangesNotifier
} from "@refinedev/react-router-v6";
import {ColorModeContextProvider} from "./contexts/color-mode";
import {Header} from "./components";
import {dataProvider} from "./providers/data-provider";
import {TestRunsList} from "./pages/test-runs";


function App() {


    return (
        <BrowserRouter>
            <RefineKbarProvider>
                <ColorModeContextProvider>
                    <AntdApp>
                        <DevtoolsProvider>
                            <Refine
                                dataProvider={dataProvider}
                                notificationProvider={useNotificationProvider}
                                routerProvider={routerBindings}
                                resources={[
                                    {
                                        name: "testruns",
                                        list: "/testruns",
                                    },
                                ]}
                                options={{
                                    syncWithLocation: true,
                                    warnWhenUnsavedChanges: true,
                                    useNewQueryKeys: true,
                                    projectId: "647Q3G-G7knsP-qJAQJR",

                                }}
                            >
                                <Routes>
                                    <Route
                                        element={(
                                            <ThemedLayoutV2
                                                Header={() => <Header sticky/>}
                                                Sider={(props) => (
                                                    <ThemedSiderV2 {...props} fixed/>
                                                )}
                                                Title={(props) => (
                                                    <ThemedTitleV2 {...props} text={"Fern Reporter"}/>
                                                )}
                                                initialSiderCollapsed={true}
                                            >
                                                <Outlet/>
                                            </ThemedLayoutV2>
                                        )}
                                    >
                                        <Route index element={
                                            <NavigateToResource resource="testruns"/>
                                        }/>
                                        <Route path="/testruns">
                                            <Route index element={<TestRunsList/>}/>
                                        </Route>
                                        <Route path="*" element={<ErrorComponent/>}/>
                                    </Route>
                                </Routes>

                                <RefineKbar/>
                                <UnsavedChangesNotifier/>
                                <DocumentTitleHandler/>
                            </Refine>
                            <DevtoolsPanel/>
                        </DevtoolsProvider>
                    </AntdApp>
                </ColorModeContextProvider>
            </RefineKbarProvider>
        </BrowserRouter>
    );
}

export default App;
