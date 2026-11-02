# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@mobile-navigation
Feature: Mobile navigation menu

  @TC-MOB-001 @smoke @regression @mobile @priority-high
  Scenario Outline: TC-MOB-001: The menu is collapsed on small screens
    # Priority: High | Type: Responsive | Page: All pages
    Given my browser window is 375 by 812 pixels
    And I open the "<page>" page
    Then the "Menu" button should be visible
    And the header navigation should be hidden
    And the menu button should show the menu is collapsed

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |

  @TC-MOB-002 @smoke @regression @mobile @priority-high
  Scenario: TC-MOB-002: Opening and closing the menu
    # Priority: High | Type: Responsive | Page: Home
    Given my browser window is 375 by 812 pixels
    And I open the "Home" page
    When I click the "Menu" button
    Then the header navigation should be visible
    And the menu button should show the menu is expanded
    When I click the "Menu" button
    Then the header navigation should be hidden
    And the menu button should show the menu is collapsed

  @TC-MOB-003 @regression @mobile @priority-high
  Scenario Outline: TC-MOB-003: Navigating to another page from the mobile menu
    # Priority: High | Type: Responsive | Page: Home
    Given my browser window is 375 by 812 pixels
    And I open the "Home" page
    When I click the "Menu" button
    And I click the "<link>" link in the header navigation
    Then I should be on the "<destination>" page

    Examples:
      | link | destination |
      | About Me | About Me |
      | Services | Services |
      | Experience | Experience |

  @TC-MOB-004 @regression @mobile @priority-medium
  Scenario: TC-MOB-004: The navigation appears when the window is widened
    # Priority: Medium | Type: Responsive | Page: Home
    Given my browser window is 375 by 812 pixels
    And I open the "Home" page
    When I resize the browser window to 1280 by 800 pixels
    Then the header navigation should be visible
    And the "Menu" button should not be visible

  @TC-MOB-005 @regression @priority-medium
  Scenario: TC-MOB-005: The menu button is not shown on desktop screens
    # Priority: Medium | Type: Responsive | Page: Home
    Given my browser window is 1280 by 800 pixels
    And I open the "Home" page
    Then the header navigation should be visible
    And the "Menu" button should not be visible

  @TC-MOB-006 @regression @mobile @priority-medium
  Scenario: TC-MOB-006: The menu collapses when the window is narrowed
    # Priority: Medium | Type: Responsive | Page: Home
    Given my browser window is 1280 by 800 pixels
    And I open the "Home" page
    When I resize the browser window to 375 by 812 pixels
    Then the "Menu" button should be visible
    And the header navigation should be hidden
    And the menu button should show the menu is collapsed
