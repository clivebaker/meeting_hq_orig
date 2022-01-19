class AddAasmStateToAgendas < ActiveRecord::Migration[7.0]
  def change
    remove_column :agendas, :state
    add_column :agendas, :aasm_state, :string
  end
end
