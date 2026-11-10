import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { FileDropzone } from '@/shared-components/file-dropzone/FileDropzone';

const labels = {
  description: 'PDF か画像、10MB まで',
  title: 'ここにファイルを置くか、押して選ぶ',
} as const;

it('描いた場合、置く場所の見出しと受け付けるファイルの説明を出すこと', () => {
  renderWithUi(
    <FileDropzone
      accept={['application/pdf']}
      error={null}
      labels={labels}
      maxSizeMegabytes={10}
      onDrop={vi.fn()}
      onReject={vi.fn()}
    />
  );

  const actual = [screen.getByText(labels.title), screen.getByText(labels.description)];

  expect(actual).toHaveLength(2);
});

it('受け付けなかった理由を渡した場合、枠の下に読み上げられる形で出すこと', () => {
  renderWithUi(
    <FileDropzone
      accept={['application/pdf']}
      error="10MB より大きいファイルは置けません"
      labels={labels}
      maxSizeMegabytes={10}
      onDrop={vi.fn()}
      onReject={vi.fn()}
    />
  );

  const actual = screen.getByRole('alert');

  expect(actual).toHaveTextContent('10MB より大きいファイルは置けません');
});
