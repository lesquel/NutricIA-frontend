/**
 * Cross-platform FormData file append.
 *
 * React Native (native): FormData accepts `{ uri, name, type }` objects.
 * Web: FormData needs a real Blob/File — the RN shorthand gets
 *      `.toString()`'d to "[object Object]" which the server rejects.
 */

import { Platform } from 'react-native';

export async function appendFileToFormData(
  formData: FormData,
  fieldName: string,
  uri: string,
  fileName: string,
  mimeType: string = 'image/jpeg',
): Promise<void> {
  if (Platform.OS === 'web') {
    // On web, fetch the URI (blob/data/object URL) to get a real Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append(fieldName, blob, fileName);
  } else {
    // On native, RN's FormData polyfill handles the { uri, name, type } pattern
    formData.append(fieldName, {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }
}
