"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Progress,
  Alert,
  Space,
  Typography,
  Divider,
  InputNumber,
  Switch,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import {
  SyncOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import ActionBar from "@/components/ui/ActionBar";
import {
  useSyncLocationsMutation,
  useSyncAreasBatchMutation,
  useGetSyncProgressQuery,
} from "@/redux/api/pathaoApi";

const { Text, Paragraph } = Typography;

const PathaoLocationsPage = () => {
  const [fullSync, setFullSync] = useState(false);
  const [maxZones, setMaxZones] = useState(10);
  const [batchSize, setBatchSize] = useState(50);
  const [startFromZoneId, setStartFromZoneId] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastBatchResult, setLastBatchResult] = useState<string | null>(null);

  const { data: progressData, refetch: refetchProgress } =
    useGetSyncProgressQuery();
  const [syncLocations, { isLoading: syncing }] = useSyncLocationsMutation();
  const [syncAreasBatch, { isLoading: batchSyncing }] =
    useSyncAreasBatchMutation();

  const progress = progressData?.data;

  const handleSyncLocations = async () => {
    try {
      const result = await syncLocations({
        fullSync,
        maxZones: fullSync ? undefined : maxZones,
      }).unwrap();
      setLastResult(result.data.message);
      message.success("Location sync completed!");
      refetchProgress();
    } catch {
      message.error("Location sync failed. Please try again.");
    }
  };

  const handleBatchSync = async () => {
    try {
      const result = await syncAreasBatch({
        batchSize,
        startFromZoneId,
      }).unwrap();
      setLastBatchResult(result.data.message);
      // Update startFromZoneId for next batch
      if (result.data.lastProcessedZoneId) {
        setStartFromZoneId(result.data.lastProcessedZoneId);
      }
      message.success("Batch sync completed!");
      refetchProgress();
    } catch {
      message.error("Batch sync failed. Please try again.");
    }
  };

  return (
    <div>
      <ActionBar title="Pathao Location Sync" />

      <Alert
        message="About Location Sync"
        description="Pathao location data (cities, zones, areas) needs to be synced from Pathao API and stored in our
database. This enables fast location selection for customers and vendors without hitting Pathao API on every request.
Sync this once a month or whenever Pathao adds new areas."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Sync Progress */}
      <Card
        title={
          <Space>
            <EnvironmentOutlined />
            <span>Current Sync Status</span>
          </Space>
        }
        extra={
          <Button
            size="small"
            onClick={refetchProgress}
            icon={<SyncOutlined />}
          >
            Refresh
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        {progress ? (
          <>
            <Row gutter={24} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic
                  title="Cities"
                  value={progress.totalCities}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Zones"
                  value={progress.totalZones}
                  prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Areas"
                  value={progress.totalAreas}
                  prefix={<CheckCircleOutlined style={{ color: "#722ed1" }} />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Zones Without Areas"
                  value={progress.zonesWithoutAreas}
                  prefix={
                    <CheckCircleOutlined
                      style={{
                        color:
                          progress.zonesWithoutAreas > 0
                            ? "#ff4d4f"
                            : "#52c41a",
                      }}
                    />
                  }
                />
              </Col>
            </Row>
            <Progress
              percent={progress.syncPercentage}
              status={progress.syncPercentage === 100 ? "success" : "active"}
              format={(percent) => `${percent}% areas synced`}
            />
            <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
              {progress.message}
            </Text>
          </>
        ) : (
          <Text type="secondary">Loading progress...</Text>
        )}
      </Card>

      <Row gutter={24}>
        {/* Full/Partial Sync */}
        <Col span={12}>
          <Card title="Sync Cities & Zones & Areas" style={{ height: "100%" }}>
            <Paragraph type="secondary">
              Syncs cities first, then zones for each city, then areas for
              zones. Use <strong>Partial Sync</strong> for quick updates (first
              N zones only). Use <strong>Full Sync</strong> for complete data —
              this can take 30+ minutes.
            </Paragraph>

            <Divider />

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Switch
                  checked={fullSync}
                  onChange={setFullSync}
                  checkedChildren="Full Sync"
                  unCheckedChildren="Partial"
                />
                <Text>
                  {fullSync
                    ? "Sync ALL zones (slow, 30+ mins)"
                    : "Partial sync (fast)"}
                </Text>
              </div>

              {!fullSync && (
                <div>
                  <Text>Max zones to sync:</Text>
                  <InputNumber
                    min={1}
                    max={100}
                    value={maxZones}
                    onChange={(v) => setMaxZones(v ?? 10)}
                    style={{ marginLeft: 12, width: 80 }}
                  />
                </div>
              )}

              {lastResult && (
                <Alert
                  message="Last Sync Result"
                  description={lastResult}
                  type="success"
                  showIcon
                  closable
                  onClose={() => setLastResult(null)}
                />
              )}

              <Button
                type="primary"
                icon={<SyncOutlined spin={syncing} />}
                loading={syncing}
                onClick={handleSyncLocations}
                size="large"
                block
              >
                {syncing ? "Syncing..." : "Start Sync"}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Batch Area Sync */}
        <Col span={12}>
          <Card title="Batch Sync Areas Only" style={{ height: "100%" }}>
            <Paragraph type="secondary">
              Use this to sync areas for remaining zones in batches. After each
              batch, the starting zone ID automatically updates so you can
              continue from where you left off.
            </Paragraph>

            <Divider />

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Text>Batch size (zones per run):</Text>
                <InputNumber
                  min={1}
                  max={200}
                  value={batchSize}
                  onChange={(v) => setBatchSize(v ?? 50)}
                  style={{ marginLeft: 12, width: 80 }}
                />
              </div>

              <div>
                <Text>Start from zone ID:</Text>
                <InputNumber
                  min={0}
                  value={startFromZoneId}
                  onChange={(v) => setStartFromZoneId(v ?? 0)}
                  style={{ marginLeft: 12, width: 100 }}
                />
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  (0 = from beginning)
                </Text>
              </div>

              {lastBatchResult && (
                <Alert
                  message="Last Batch Result"
                  description={lastBatchResult}
                  type="success"
                  showIcon
                  closable
                  onClose={() => setLastBatchResult(null)}
                />
              )}

              <Button
                type="primary"
                icon={<SyncOutlined spin={batchSyncing} />}
                loading={batchSyncing}
                onClick={handleBatchSync}
                size="large"
                block
                ghost
              >
                {batchSyncing ? "Syncing Batch..." : "Sync Next Batch"}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PathaoLocationsPage;
