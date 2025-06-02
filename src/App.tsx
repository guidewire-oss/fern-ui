import './index.css';
import {Refine,} from '@refinedev/core';
import {DevtoolsPanel, DevtoolsProvider} from "@refinedev/devtools";
import {RefineKbar, RefineKbarProvider} from "@refinedev/kbar";

import {ErrorComponent, ThemedLayoutV2, useNotificationProvider} from '@refinedev/antd';
import "@refinedev/antd/dist/reset.css";

import {App as AntdApp} from "antd"
import {BrowserRouter, Outlet, Route, Routes} from "react-router-dom";
import routerBindings, {
    DocumentTitleHandler,
    NavigateToResource,
    UnsavedChangesNotifier
} from "@refinedev/react-router-v6";
import {ColorModeContextProvider} from "./contexts/color-mode";
import {Header, LoadingSpinner} from "./components";
import {graphqlDataProvider} from "./providers/testrun-graphql-provider";
import {summaryProvider} from "./providers/summary-provider";
import {TestRunsList} from "./pages/test-runs";
import {TestSummary} from "./pages/test-summaries";
import {UserPreferencePage} from "./pages/user-preference"
import { fetchUserPreference } from "./pages/user-preference/user-preference-utils";
import { useContext, useEffect, useState } from 'react';
import { ColorModeContext } from "../src/contexts/color-mode";
import moment from 'moment-timezone';

const NoSider: React.FC = () => null; // to hide the side-navbar

function AppContent() {
    const { setMode } = useContext(ColorModeContext);
    const [timezone, setTimezone] = useState(moment.tz.guess());
    const [isUserPreferencesLoaded, setIsUserPreferencesLoaded] = useState(false);

    useEffect(() => {
        const initUserPreferences = async () => {
            try {
                const userPref = await fetchUserPreference();
                if (userPref) {
                    setMode(userPref.isDark ? "dark" : "light");
                    setTimezone(userPref.timezone);
                }
            } catch (err) {
                console.error("Failed to load user preferences:", err);
            } finally {
                setIsUserPreferencesLoaded(true);
            }
        };
        initUserPreferences();
    }, []);

    if (!isUserPreferencesLoaded) {
        return <LoadingSpinner />;
    }

    return (
        <BrowserRouter>
            <RefineKbarProvider>
                <ColorModeContextProvider>
                    <AntdApp>
                        <DevtoolsProvider>
                            <Refine
                                dataProvider={{
                                    default: graphqlDataProvider,
                                    testruns: graphqlDataProvider,
                                    summaries: summaryProvider,
                                }}
                                notificationProvider={useNotificationProvider}
                                routerProvider={routerBindings}
                                resources={[
                                    {
                                        name: "Test Reports",
                                    },
                                    {
                                        name: "testruns",
                                        list: "/testruns",
                                        meta: {
                                            parent: "Test Reports",
                                            dataProviderName: "testruns",
                                        },
                                    },
                                    {
                                        name: "summaries",
                                        list: "/testsummaries",
                                        meta: {
                                            parent: "Test Reports",
                                            dataProviderName: "summaries",
                                        },
                                    },
                                    {
                                        name: "preferences",
                                        list: "/preferences",
                                        meta: {
                                            parent: "Test Reports",
                                            dataProviderName: "userpreference",
                                        },
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
                                                Sider={NoSider}
                                            >
                                                <Outlet/>
                                            </ThemedLayoutV2>
                                        )}
                                    >
                                        <Route index element={
                                            <NavigateToResource resource="summaries"/>
                                        }/>
                                        <Route path="/testruns">
                                            <Route index element={<TestRunsList/>}/>
                                        </Route>
                                        <Route path="/testruns/:suiteId">
                                            <Route index element={<TestRunsList/>}/>
                                        </Route>
                                        <Route path="/testsummaries">
                                            <Route index element={<TestSummary />} />
                                        </Route>
                                        <Route path="/preferences">
                                            <Route index element={<UserPreferencePage />} />
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

function App() {
    return (
        <ColorModeContextProvider>
            <AppContent />
        </ColorModeContextProvider>
    );
}

export default App;
