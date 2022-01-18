class CreateAgendas < ActiveRecord::Migration[7.0]
  def change
    create_table :agendas do |t|
      t.references :meeting, null: false, foreign_key: true
      t.string :name
      t.integer :position
      t.string :state

      t.timestamps
    end
  end
end
