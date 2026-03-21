import { test, expect } from '@playwright/test';

test.describe('Objectives Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and navigate to objectives page
    await page.goto('/objectives');
  });

  test('objectives page is interactive', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is present
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check that interactive elements are present and accessible
    const createButton = page.getByTestId('create-objective-button');
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
    
    // Check that filters are interactive
    const periodSelector = page.getByTestId('period-selector');
    await expect(periodSelector).toBeVisible();
    await expect(periodSelector).toBeEnabled();
    
    const levelFilter = page.getByTestId('level-filter');
    await expect(levelFilter).toBeVisible();
    await expect(levelFilter).toBeEnabled();
    
    const statusFilter = page.getByTestId('status-filter');
    await expect(statusFilter).toBeVisible();
    await expect(statusFilter).toBeEnabled();
    
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
    
    // Verify search functionality works
    await searchInput.fill('test search');
    await expect(searchInput).toHaveValue('test search');
    
    // Verify filter interactions work
    await levelFilter.selectOption('team');
    await expect(levelFilter).toHaveValue('team');
    
    await statusFilter.selectOption('active');
    await expect(statusFilter).toHaveValue('active');
    
    // Check that content area is present (either loading, empty state, or objectives grid)
    const contentArea = page.locator('[data-testid="objectives-loading"], [data-testid="objectives-empty-state"], [data-testid="objectives-grid"]');
    await expect(contentArea).toBeVisible();
    
    // If objectives are present, check that they're interactive
    const objectiveCards = page.locator('[data-testid^="objective-card-"]');
    const cardCount = await objectiveCards.count();
    
    if (cardCount > 0) {
      const firstCard = objectiveCards.first();
      await expect(firstCard).toBeVisible();
      // Verify card elements are present
      await expect(firstCard.getByTestId('objective-title')).toBeVisible();
      await expect(firstCard.getByTestId('level-badge')).toBeVisible();
      await expect(firstCard.getByTestId('confidence-badge')).toBeVisible();
      await expect(firstCard.getByTestId('progress-section')).toBeVisible();
    }
    
    // Final assertion that should always be true if page is interactive
    const interactiveElements = [
      createButton,
      periodSelector,
      levelFilter,
      statusFilter,
      searchInput
    ];
    
    for (const element of interactiveElements) {
      await expect(element).toBeVisible();
      await expect(element).toBeEnabled();
    }
  });
  
  test('can interact with objective cards when present', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    const contentArea = page.locator('[data-testid="objectives-loading"], [data-testid="objectives-empty-state"], [data-testid="objectives-grid"]');
    await expect(contentArea).toBeVisible();
    
    // Check if we have objective cards
    const objectiveCards = page.locator('[data-testid^="objective-card-"]');
    const cardCount = await objectiveCards.count();
    
    if (cardCount > 0) {
      const firstCard = objectiveCards.first();
      
      // Test card interactivity
      await expect(firstCard).toBeVisible();
      
      // Test keyboard navigation
      await firstCard.focus();
      await expect(firstCard).toBeFocused();
      
      // Test that card content is accessible
      await expect(firstCard.getByTestId('objective-title')).toBeVisible();
      await expect(firstCard.getByTestId('level-badge')).toBeVisible();
      await expect(firstCard.getByTestId('confidence-badge')).toBeVisible();
    }
  });
});