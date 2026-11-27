import { Box, Button, Flex, FormControl, FormLabel, Input, Text } from "@chakra-ui/react";
import { droneGround } from "./drone";
import { fill, type DroneText } from "./i18n";

type Props = {
  text: DroneText;
  verticalFieldOfView: number; // degrees, from the current lens + sensor
  altitude: string;
  tilt: string;
  onAltitudeChange: (value: string) => void;
  onTiltChange: (value: string) => void;
  onApplySubjectDistance: (meters: number) => void;
};

// Distance slider is 10–400 inches (≈10.2 m); anything farther is capped when applied.
const SLIDER_MAX_M = 400 * 0.0254;

export default function DroneCalculator({
  text,
  verticalFieldOfView,
  altitude,
  tilt,
  onAltitudeChange,
  onTiltChange,
  onApplySubjectDistance,
}: Props) {

  const fmt = (m: number) => (Number.isFinite(m) ? `${m.toFixed(1)} m` : text.infinite);

  let result: ReturnType<typeof droneGround> | null = null;
  let error = false;
  try {
    result = droneGround(Number(altitude), Number(tilt), verticalFieldOfView);
  } catch {
    error = true;
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={2}>
        {text.title}
      </Text>
      <Flex gap={3} wrap="wrap" align="flex-end">
        <FormControl maxW="140px">
          <FormLabel fontSize="xs" mb={1}>{text.altitude}</FormLabel>
          <Input size="sm" type="number" min={0} value={altitude} onChange={(e) => onAltitudeChange(e.target.value)} />
        </FormControl>
        <FormControl maxW="140px">
          <FormLabel fontSize="xs" mb={1}>{text.tilt}</FormLabel>
          <Input size="sm" type="number" min={0} max={90} value={tilt} onChange={(e) => onTiltChange(e.target.value)} />
        </FormControl>
      </Flex>
      {error && (
        <Text fontSize="xs" color="red.400" mt={2}>
          {text.invalid}
        </Text>
      )}
      {result && (
        <Box mt={3} fontSize="sm">
          <Text>{text.slant}: {fmt(result.slantM)}</Text>
          <Text>{text.groundCenter}: {fmt(result.groundM)}</Text>
          <Text>{fill(text.frameRange, fmt(result.nearGroundM), fmt(result.farGroundM))}</Text>
          {result.slantM > SLIDER_MAX_M && (
            <Text fontSize="xs" color="orange.400" mt={1}>
              {fill(text.capped, SLIDER_MAX_M.toFixed(1))}
            </Text>
          )}
          <Button
            mt={2}
            size="sm"
            onClick={() => onApplySubjectDistance(result!.slantM)}
            isDisabled={!Number.isFinite(result.slantM)}
          >
            {text.apply}
          </Button>
        </Box>
      )}
    </Box>
  );
}
