import { Box, Tab, Tabs, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { PropsWithChildren, ReactElement } from "react";
import * as React from "react";

// We can't restrict the type of child nodes, but we can type-check their props, so there's that. https://github.com/microsoft/TypeScript/issues/21699
type TabPanelProps = PropsWithChildren<{
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  warning?: React.ReactNode;
}>;
export const TabPanel: React.FC<TabPanelProps> = ({ children, label }) => null;
// is this the right way to do a render-less component? we just want props (and children)

export const TabbedPanels: React.FC<{
  panels: ReactElement<TabPanelProps>[];
  initialTabIdx?: number;
}> = (props) => {
  const [tab, setTab] = React.useState<number>(props.initialTabIdx || 0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <React.Fragment>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {props.panels.map((tp, idx) => {
            const tooltip = tp.props.warning ? (
              <Tooltip title={tp.props.warning}>
                <WarningIcon fontSize="small" color="warning" />
              </Tooltip>
            ) : tp.props.tooltip ? (
              <Tooltip title={tp.props.tooltip}>
                <InfoIcon fontSize="small" color="info" />
              </Tooltip>
            ) : undefined;

            return (
              // TODO the icon adds padding to the tab?
              <Tab
                label={tp.props.label}
                icon={tooltip}
                iconPosition="end"
                value={idx}
                key={"tab-" + idx}
              />
            );
          })}
        </Tabs>
      </Box>
      {props.panels.map((tp, idx) => (
        <TabPanelContent currentTab={tab} index={idx} key={"tab-panel-" + idx}>
          {tp.props.children}
        </TabPanelContent>
      ))}
    </React.Fragment>
  );
};

const TabPanelContent: React.FC<{
  currentTab: number;
  index: number;
}> = ({ children, currentTab, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={currentTab !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {currentTab === index && <Box sx={{ paddingTop: 2 }}>{children}</Box>}
    </div>
  );
};
