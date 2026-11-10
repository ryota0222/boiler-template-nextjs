import { SSOButtons } from '@template/ui/blocks/sso-buttons/SSOButtons';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

it('ボタンを押した場合、その会社のログインを始めること', () => {
  const onClick = vi.fn();
  renderWithUi(
    <SSOButtons
      pendingProviderId={null}
      providers={[
        { id: 'google', label: 'Google でログイン', logoSrc: '/brand/google.svg', onClick },
      ]}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Google でログイン' }));

  expect(onClick).toHaveBeenCalledOnce();
});

it('どれかのログインを始めている場合、ほかのボタンを押せなくすること', () => {
  renderWithUi(
    <SSOButtons
      pendingProviderId="google"
      providers={[
        {
          id: 'google',
          label: 'Google でログイン',
          logoSrc: '/brand/google.svg',
          onClick: vi.fn(),
        },
        {
          id: 'microsoft',
          label: 'Microsoft アカウントでサインイン',
          logoSrc: '/brand/microsoft.svg',
          onClick: vi.fn(),
        },
      ]}
    />
  );

  const actual = screen.getByRole('button', { name: 'Microsoft アカウントでサインイン' });

  expect(actual).toBeDisabled();
});
