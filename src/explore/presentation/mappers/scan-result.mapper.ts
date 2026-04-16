import { ScanPoiResultDto } from '../../application/dto/scan-poi-result.dto';
import { ScanResultResponse } from '../dto/responses/scan-result.response.dto';

export class ScanResultMapper {
  static toResponse(
    result: ScanPoiResultDto,
    modelUrl: string | null,
  ): ScanResultResponse {
    return {
      uuid: result.scan.id.toString(),
      poiUuid: result.poi.uuid,
      poiTitle: result.poi.title,
      interestingData: result.poi.interestingData ?? null,
      modelUrl,
      scannedAt: result.scan.scannedAt,
    };
  }
}
