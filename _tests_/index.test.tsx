import './index.mock';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Index from '@pages/index';
import { ChakraProvider } from '@chakra-ui/react';

beforeEach(() => {
  // IntersectionObserver isn't available in test environment
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('Home', () => {
  it('renders the index page', () => {
    render(
      <ChakraProvider>
        <Index API_KEY={null} />
      </ChakraProvider>,
    );
    const learning = screen.getByRole('heading', {
      name: 'Learn more about us!',
    });
    expect(learning).toBeInTheDocument();
    const experience = screen.getByRole('heading', {
      name: 'Experience the life of a KEVIIAN',
    });
    expect(experience).toBeInTheDocument();
    const fb = screen.getByRole('link', {
      name: 'Facebook Page',
    });
    expect(fb).toBeInTheDocument();
    const ig = screen.getByRole('link', {
      name: 'Instagram Page',
    });
    expect(experience).toBeInTheDocument();
    const yt = screen.getByRole('link', {
      name: 'Youtube Page',
    });
    expect(yt).toBeInTheDocument();
  });
});
