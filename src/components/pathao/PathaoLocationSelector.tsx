"use client";

import { Select, Form, Space } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/redux/api/pathaoApi";
import type { IPathaoCity, IPathaoZone, IPathaoArea } from "@/types/pathao";

interface PathaoLocationSelectorProps {
  cityId?: number | null;
  zoneId?: number | null;
  areaId?: number | null;
  onCityChange: (cityId: number | null) => void;
  onZoneChange: (zoneId: number | null) => void;
  onAreaChange: (areaId: number | null) => void;
  disabled?: boolean;
  required?: boolean;
}

const PathaoLocationSelector = ({
  cityId,
  zoneId,
  areaId,
  onCityChange,
  onZoneChange,
  onAreaChange,
  disabled = false,
  required = false,
}: PathaoLocationSelectorProps) => {
  // Fetch cities
  const { data: cities, isLoading: loadingCities } =
    useGetCitiesQuery(undefined);

  // Fetch zones when city is selected
  const { data: zones, isLoading: loadingZones } = useGetZonesQuery(cityId!, {
    skip: !cityId,
  });

  // Fetch areas when zone is selected
  const { data: areas, isLoading: loadingAreas } = useGetAreasQuery(zoneId!, {
    skip: !zoneId,
  });

  const citiesData = cities as IPathaoCity[] | undefined;
  const zonesData = zones as IPathaoZone[] | undefined;
  const areasData = areas as IPathaoArea[] | undefined;

  const handleCityChange = (value: number) => {
    onCityChange(value);
    // Reset dependent fields
    onZoneChange(null);
    onAreaChange(null);
  };

  const handleZoneChange = (value: number) => {
    onZoneChange(value);
    // Reset dependent field
    onAreaChange(null);
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }} size="middle">
      {/* City Selector */}
      <Form.Item
        label={
          <span>
            <EnvironmentOutlined /> City
          </span>
        }
        required={required}
      >
        <Select
          placeholder="Select City"
          value={cityId}
          onChange={handleCityChange}
          loading={loadingCities}
          disabled={disabled}
          allowClear
          showSearch
          optionFilterProp="children"
          size="large"
        >
          {citiesData?.map((city) => (
            <Select.Option key={city.cityId} value={city.cityId}>
              {city.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Zone Selector */}
      <Form.Item
        label={
          <span>
            <EnvironmentOutlined /> Zone
          </span>
        }
        required={required}
      >
        <Select
          placeholder={cityId ? "Select Zone" : "Select City first"}
          value={zoneId}
          onChange={handleZoneChange}
          loading={loadingZones}
          disabled={disabled || !cityId}
          allowClear
          showSearch
          optionFilterProp="children"
          size="large"
        >
          {zonesData?.map((zone) => (
            <Select.Option key={zone.zoneId} value={zone.zoneId}>
              {zone.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Area Selector */}
      <Form.Item
        label={
          <span>
            <EnvironmentOutlined /> Area
          </span>
        }
        required={required}
      >
        <Select
          placeholder={zoneId ? "Select Area" : "Select Zone first"}
          value={areaId}
          onChange={onAreaChange}
          loading={loadingAreas}
          disabled={disabled || !zoneId}
          allowClear
          showSearch
          optionFilterProp="children"
          size="large"
        >
          {areasData?.map((area) => (
            <Select.Option key={area.areaId} value={area.areaId}>
              {area.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Space>
  );
};

export default PathaoLocationSelector;
