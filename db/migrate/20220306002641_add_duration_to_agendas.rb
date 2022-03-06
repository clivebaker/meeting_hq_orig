class AddDurationToAgendas < ActiveRecord::Migration[7.0]
  def change
    add_column :agendas, :duration_minutes, :integer
  end
end
