import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Expense } from './expense.entity';

@Entity({ name: 'expense_participants' })
@Unique('uq_expense_participants_expense_id_user_id', ['expenseId', 'userId'])
export class ExpenseParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expense_id', type: 'uuid' })
  expenseId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'share_amount', type: 'numeric', precision: 12, scale: 2 })
  shareAmount: number;

  @ManyToOne(() => Expense, (expense) => expense.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'expense_id' })
  expense: Expense;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
