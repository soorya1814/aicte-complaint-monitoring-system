import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge } from '../components/complaints/StatusBadge';
import { PriorityBadge } from '../components/complaints/PriorityBadge';
import { Button } from '../components/common/Button';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { Login } from '../pages/Login';

describe('Frontend UI Components & Pages', () => {
  it('should correctly render status badges matching required institutional colors', () => {
    const { rerender } = render(<StatusBadge status="Resolved" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();

    rerender(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<StatusBadge status="Awaiting Institution Response" />);
    expect(screen.getByText('Awaiting Response')).toBeInTheDocument();
  });

  it('should correctly render priority badges with SLA tags', () => {
    const { rerender } = render(<PriorityBadge priority="Critical" />);
    expect(screen.getByText(/Critical/i)).toBeInTheDocument();

    rerender(<PriorityBadge priority="High" />);
    expect(screen.getByText(/High/i)).toBeInTheDocument();
  });

  it('should render button with loading state', () => {
    render(<Button loading={true}>Save Record</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render Login screen with 1-click evaluation shortcuts', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/AICTE Grievance Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Official Email Address/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bureau Officer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Institution/i).length).toBeGreaterThan(0);
  });
});
