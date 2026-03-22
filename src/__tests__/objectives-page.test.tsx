/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ObjectivesPage from '@/app/(app)/objectives/page';
import { useI18n } from '@/lib/i18n';

// Mock the dependencies
jest.mock('@/lib/i18n', () => ({
  useI18n: jest.fn(() => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: jest.fn(),
  })),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockPeriods = [
  { id: '1', label: 'Q1 2024', isActive: true, startDate: '2024-01-01', endDate: '2024-03-31', createdAt: '2024-01-01' },
  { id: '2', label: 'Q2 2024', isActive: false, startDate: '2024-04-01', endDate: '2024-06-30', createdAt: '2024-01-01' },
];

const mockObjectives = [
  {
    id: 'obj-1',
    title: 'Increase revenue',
    description: 'Boost company revenue by 20%',
    level: 'company',
    progress: 75,
    confidence: 'on_track',
    status: 'active',
    ownerId: 'user-1',
    periodId: '1',
    teamId: null,
    parentObjectiveId: null,
    sortOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    owner: { id: 'user-1', fullName: 'John Doe', email: 'john@example.com' },
  },
];

describe('ObjectivesPage Interactive Elements', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders all interactive elements correctly', async () => {
    // Setup fetch responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockObjectives,
      } as Response);

    render(<ObjectivesPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('objectives-page')).toBeInTheDocument();
    });

    // Check that create button is present and clickable
    const createBtn = screen.getByTestId('create-objective-btn');
    expect(createBtn).toBeInTheDocument();
    expect(createBtn).toHaveAttribute('href', '/objectives/new');
    expect(createBtn).toHaveAttribute('role', 'button');

    // Check filters are interactive
    expect(screen.getByTestId('period-selector')).toBeInTheDocument();
    expect(screen.getByTestId('level-filter')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();

    // Check that objectives grid is present
    await waitFor(() => {
      expect(screen.getByTestId('objectives-grid')).toBeInTheDocument();
    });
  });

  it('filters work correctly', async () => {
    const user = userEvent.setup();
    
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockObjectives,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

    render(<ObjectivesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('objectives-page')).toBeInTheDocument();
    });

    // Test level filter interaction
    const levelFilter = screen.getByTestId('level-filter');
    await user.selectOptions(levelFilter, 'company');
    expect(levelFilter).toHaveValue('company');

    // Test status filter interaction
    const statusFilter = screen.getByTestId('status-filter');
    await user.selectOptions(statusFilter, 'active');
    expect(statusFilter).toHaveValue('active');

    // Test search input
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'revenue');
    expect(searchInput).toHaveValue('revenue');
  });

  it('handles keyboard navigation on objective cards', async () => {
    const user = userEvent.setup();
    
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockObjectives,
      } as Response);

    render(<ObjectivesPage />);

    await waitFor(() => {
      expect(screen.getByTestId(`objective-link-${mockObjectives[0].id}`)).toBeInTheDocument();
    });

    const objectiveLink = screen.getByTestId(`objective-link-${mockObjectives[0].id}`);
    
    // Check that the link is focusable
    expect(objectiveLink).toHaveAttribute('tabIndex', '0');
    expect(objectiveLink).toHaveAttribute('role', 'button');
    
    // Test keyboard focus
    objectiveLink.focus();
    expect(document.activeElement).toBe(objectiveLink);
  });

  it('shows loading state correctly', () => {
    // Don't resolve the fetch promises to keep loading state
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(<ObjectivesPage />);

    expect(screen.getByTestId('loading-grid')).toBeInTheDocument();
  });

  it('shows empty state when no objectives', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

    render(<ObjectivesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('has proper ARIA labels and accessibility attributes', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockObjectives,
      } as Response);

    render(<ObjectivesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('objectives-page')).toBeInTheDocument();
    });

    // Check ARIA labels on interactive elements
    const createBtn = screen.getByTestId('create-objective-btn');
    expect(createBtn).toHaveAttribute('aria-label');

    const periodSelector = screen.getByTestId('period-selector');
    expect(periodSelector).toHaveAttribute('aria-label');

    const levelFilter = screen.getByTestId('level-filter');
    expect(levelFilter).toHaveAttribute('aria-label');

    const statusFilter = screen.getByTestId('status-filter');
    expect(statusFilter).toHaveAttribute('aria-label');

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('aria-label');
  });
});
